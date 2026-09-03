import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ItemFila, StatusSync, TipoOperacao } from '../../types/sync';
import type { EventoInput } from '../../types/evento';

const FILA_KEY = '@saquainfo/fila_sync';
const ULTIMA_SYNC_KEY = '@saquainfo/ultima_sincronizacao';

async function lerFila(): Promise<ItemFila[]> {
  const bruto = await AsyncStorage.getItem(FILA_KEY);
  if (!bruto) return [];

  try {
    const parsed = JSON.parse(bruto);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function gravarFila(fila: ItemFila[]): Promise<void> {
  await AsyncStorage.setItem(FILA_KEY, JSON.stringify(fila));
}

export async function obterFila(): Promise<ItemFila[]> {
  return lerFila();
}

export async function obterPendentes(): Promise<ItemFila[]> {
  const fila = await lerFila();
  return fila.filter((item) => item.status === 'PENDENTE');
}

export async function obterStatusEvento(id: string): Promise<StatusSync> {
  const fila = await lerFila();
  const item = fila.find((registro) => registro.id === id);
  return item?.status ?? 'SINCRONIZADO';
}

export async function enfileirarOperacao(params: {
  id: string;
  operacao: TipoOperacao;
  descricao: string;
  payload: EventoInput | null;
}): Promise<ItemFila[]> {
  const agora = new Date().toISOString();
  const fila = await lerFila();
  const existente = fila.find((item) => item.id === params.id);

  if (params.operacao === 'EXCLUIR' && existente?.operacao === 'CRIAR' && existente.status === 'PENDENTE') {
    const restante = fila.filter((item) => item.id !== params.id);
    await gravarFila(restante);
    return restante;
  }

  if (existente && existente.status !== 'SINCRONIZANDO') {
    existente.operacao = existente.operacao === 'CRIAR' && params.operacao === 'ATUALIZAR' ? 'CRIAR' : params.operacao;
    existente.descricao = params.descricao;
    existente.payload = params.payload;
    existente.status = 'PENDENTE';
    existente.atualizadoEm = agora;
    existente.erro = undefined;
    await gravarFila(fila);
    return fila;
  }

  fila.unshift({
    id: params.id,
    operacao: params.operacao,
    descricao: params.descricao,
    payload: params.payload,
    status: 'PENDENTE',
    criadoEm: agora,
    atualizadoEm: agora,
  });

  await gravarFila(fila);
  return fila;
}

export async function atualizarStatusItem(
  id: string,
  status: StatusSync,
  erro?: string
): Promise<ItemFila[]> {
  const fila = await lerFila();
  const item = fila.find((registro) => registro.id === id);
  if (!item) return fila;

  item.status = status;
  item.atualizadoEm = new Date().toISOString();
  item.erro = erro;

  await gravarFila(fila);
  return fila;
}

export async function salvarUltimaSincronizacao(iso: string): Promise<void> {
  await AsyncStorage.setItem(ULTIMA_SYNC_KEY, iso);
}

export async function obterUltimaSincronizacao(): Promise<string | null> {
  return AsyncStorage.getItem(ULTIMA_SYNC_KEY);
}
