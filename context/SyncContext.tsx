import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { atualizarEvento, criarEvento, excluirEvento } from '../lib/db/eventos';
import { enfileirarOperacao, obterFila, obterPendentes, obterUltimaSincronizacao } from '../lib/sync/fila';
import { sincronizarDados } from '../lib/sync/sincronizar';
import type { EventoInput } from '../types/evento';
import type { FaseConexao, ItemFila } from '../types/sync';

function estaOnline(state: NetInfoState): boolean {
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

function formatarHora(iso: string | null): string | null {
  if (!iso) return null;
  const data = new Date(iso);
  if (isNaN(data.getTime())) return null;
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function textoPendentes(quantidade: number): string {
  const n = Math.max(quantidade, 0);
  return `${n} alteração${n === 1 ? '' : 'ões'} pendente${n === 1 ? '' : 's'}`;
}

interface SyncContextValue {
  isConnected: boolean;
  fase: FaseConexao;
  mensagem: string;
  fila: ItemFila[];
  pendentes: number;
  ultimaSincronizacao: string | null;
  horaUltimaSincronizacao: string | null;
  sincronizar: () => Promise<void>;
  salvarEvento: (dados: EventoInput, idExistente?: string) => Promise<string>;
  removerEvento: (id: string, titulo: string) => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [fila, setFila] = useState<ItemFila[]>([]);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string | null>(null);
  const [mostrarConcluido, setMostrarConcluido] = useState(false);
  const syncEmAndamento = useRef(false);
  const estavaOffline = useRef(false);

  const pendentes = useMemo(
    () => fila.filter((item) => item.status === 'PENDENTE' || item.status === 'SINCRONIZANDO').length,
    [fila]
  );

  const horaUltimaSincronizacao = formatarHora(ultimaSincronizacao);

  const fase: FaseConexao = !isConnected
    ? 'offline'
    : sincronizando
      ? 'sincronizando'
      : mostrarConcluido
        ? 'concluido'
        : 'conectado';

  const mensagem = useMemo(() => {
    if (fase === 'offline') {
      return 'Suas alterações serão armazenadas e sincronizadas quando a conexão retornar.';
    }
    if (fase === 'sincronizando') {
      return `Sincronizando dados… ${textoPendentes(pendentes)}.`;
    }
    if (fase === 'concluido') {
      return horaUltimaSincronizacao
        ? `Dados sincronizados — Última sincronização: ${horaUltimaSincronizacao}`
        : 'Dados sincronizados.';
    }
    return 'Conexão ativa.';
  }, [fase, pendentes, horaUltimaSincronizacao]);

  const recarregarFila = useCallback(async () => {
    const [itens, ultima] = await Promise.all([obterFila(), obterUltimaSincronizacao()]);
    setFila(itens);
    setUltimaSincronizacao(ultima);
  }, []);

  const sincronizar = useCallback(async () => {
    if (syncEmAndamento.current) return;

    const aguardando = await obterPendentes();
    if (aguardando.length === 0) {
      await recarregarFila();
      return;
    }

    syncEmAndamento.current = true;
    setSincronizando(true);
    setMostrarConcluido(false);

    try {
      const resultado = await sincronizarDados();
      setFila(resultado.fila.length > 0 ? resultado.fila : await obterFila());
      setUltimaSincronizacao(await obterUltimaSincronizacao());
      if (resultado.enviados > 0 && resultado.falhas === 0) {
        setMostrarConcluido(true);
      }
    } finally {
      syncEmAndamento.current = false;
      setSincronizando(false);
    }
  }, [recarregarFila]);

  const salvarEvento = useCallback(
    async (dados: EventoInput, idExistente?: string) => {
      const isEdicao = Boolean(idExistente);
      const id = isEdicao ? idExistente as string : await criarEvento(dados);

      if (isEdicao) {
        await atualizarEvento(id, dados);
      }

      const novaFila = await enfileirarOperacao({
        id,
        operacao: isEdicao ? 'ATUALIZAR' : 'CRIAR',
        descricao: isEdicao ? `Atualizar: ${dados.titulo}` : `Novo evento: ${dados.titulo}`,
        payload: dados,
      });
      setFila(novaFila);
      setMostrarConcluido(false);

      if (isConnected) {
        void sincronizar();
      }

      return id;
    },
    [isConnected, sincronizar]
  );

  const removerEvento = useCallback(
    async (id: string, titulo: string) => {
      await excluirEvento(id);
      const novaFila = await enfileirarOperacao({
        id,
        operacao: 'EXCLUIR',
        descricao: `Excluir: ${titulo}`,
        payload: null,
      });
      setFila(novaFila);
      setMostrarConcluido(false);

      if (isConnected) {
        void sincronizar();
      }
    },
    [isConnected, sincronizar]
  );

  useEffect(() => {
    recarregarFila();
  }, [recarregarFila]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = estaOnline(state);
      setIsConnected(online);

      if (online && estavaOffline.current) {
        void sincronizar();
      }

      estavaOffline.current = !online;
    });

    NetInfo.fetch().then((state) => {
      const online = estaOnline(state);
      setIsConnected(online);
      estavaOffline.current = !online;
    });

    return () => unsubscribe();
  }, [sincronizar]);

  useEffect(() => {
    if (fase !== 'concluido') return;
    const timer = setTimeout(() => setMostrarConcluido(false), 8000);
    return () => clearTimeout(timer);
  }, [fase]);

  const value = useMemo(
    () => ({
      isConnected,
      fase,
      mensagem,
      fila,
      pendentes,
      ultimaSincronizacao,
      horaUltimaSincronizacao,
      sincronizar,
      salvarEvento,
      removerEvento,
    }),
    [
      isConnected,
      fase,
      mensagem,
      fila,
      pendentes,
      ultimaSincronizacao,
      horaUltimaSincronizacao,
      sincronizar,
      salvarEvento,
      removerEvento,
    ]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const contexto = useContext(SyncContext);
  if (!contexto) {
    throw new Error('useSync deve ser usado dentro de SyncProvider.');
  }
  return contexto;
}
