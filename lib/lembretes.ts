import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { CANAL_LEMBRETES, prepararNotificacaoLocal } from './notificacoes';
import type { Lembrete } from '../types/lembrete';

const CHAVE = '@saquainfo/lembretes';

type ArquivoLembretes = {
  nextId: number;
  itens: Lembrete[];
};

const vazio = (): ArquivoLembretes => ({ nextId: 1, itens: [] });

let fila: Promise<unknown> = Promise.resolve();

function emFila<T>(tarefa: () => Promise<T>): Promise<T> {
  const execucao = fila.then(tarefa, tarefa);
  fila = execucao.then(
    () => undefined,
    () => undefined
  );
  return execucao;
}

export function instanteSemSegundos(data: Date): Date {
  const copia = new Date(data);
  copia.setSeconds(0, 0);
  return copia;
}

export function horarioSugerido(dataInicio?: string): Date {
  const daquiADezMinutos = instanteSemSegundos(new Date(Date.now() + 10 * 60 * 1000));
  if (!dataInicio) return daquiADezMinutos;

  const inicio = new Date(dataInicio);
  if (Number.isNaN(inicio.getTime())) return daquiADezMinutos;

  const trintaMinutosAntes = instanteSemSegundos(new Date(inicio.getTime() - 30 * 60 * 1000));
  if (trintaMinutosAntes.getTime() <= Date.now()) return daquiADezMinutos;
  return trintaMinutosAntes;
}

async function ler(): Promise<ArquivoLembretes> {
  const bruto = await AsyncStorage.getItem(CHAVE);
  if (!bruto) return vazio();

  try {
    const arquivo = JSON.parse(bruto) as ArquivoLembretes;
    if (!arquivo || !Array.isArray(arquivo.itens) || typeof arquivo.nextId !== 'number') return vazio();
    return arquivo;
  } catch {
    return vazio();
  }
}

async function gravar(arquivo: ArquivoLembretes) {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(arquivo));
}

export async function listarLembretes(): Promise<Lembrete[]> {
  const arquivo = await ler();
  return arquivo.itens;
}

export async function agendarLembrete(entrada: {
  titulo: string;
  mensagem: string;
  quando: Date;
  eventoId?: string;
}): Promise<{ ok: true } | { ok: false; mensagem: string }> {
  const titulo = entrada.titulo.trim();
  const mensagem = entrada.mensagem.trim();
  if (!titulo || !mensagem) {
    return { ok: false, mensagem: 'Informe o título e a mensagem. Nenhum lembrete foi salvo.' };
  }

  const quando = instanteSemSegundos(entrada.quando);
  if (quando.getTime() <= Date.now()) {
    return { ok: false, mensagem: 'Escolha um horário futuro. Nenhum lembrete foi salvo.' };
  }

  const pronto = await prepararNotificacaoLocal();
  if (!pronto.ok) return pronto;

  return emFila(async () => {
    const arquivo = await ler();
    const id = arquivo.nextId;
    const identificador = `lembrete-${id}`;

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: identificador,
        content: {
          title: titulo,
          body: mensagem,
          data: {
            origem: 'lembrete',
            lembreteId: String(id),
            eventoId: entrada.eventoId ?? '',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: quando,
          channelId: CANAL_LEMBRETES,
        },
      });
    } catch {
      return { ok: false, mensagem: 'Não foi possível agendar o lembrete. Nada foi salvo.' };
    }

    const lembrete: Lembrete = {
      id,
      titulo,
      mensagem,
      quando: quando.getTime(),
      status: 'Agendado',
      identificador,
      eventoId: entrada.eventoId || undefined,
    };
    arquivo.nextId = id + 1;
    arquivo.itens = [lembrete, ...arquivo.itens];

    try {
      await gravar(arquivo);
    } catch {
      await Notifications.cancelScheduledNotificationAsync(identificador);
      return { ok: false, mensagem: 'O lembrete não foi salvo neste aparelho. O alarme foi desfeito.' };
    }

    return { ok: true };
  });
}

export async function cancelarLembrete(id: number): Promise<{ ok: true } | { ok: false; mensagem: string }> {
  return emFila(async () => {
    const arquivo = await ler();
    const item = arquivo.itens.find((lembrete) => lembrete.id === id);
    if (!item) return { ok: false, mensagem: 'Lembrete não encontrado.' };
    if (item.status !== 'Agendado') {
      return { ok: false, mensagem: 'Este lembrete não está mais agendado.' };
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(item.identificador);
    } catch {
      return { ok: false, mensagem: 'Não foi possível cancelar o alarme. O lembrete continua agendado.' };
    }

    try {
      await Notifications.dismissNotificationAsync(item.identificador);
    } catch {
      // O aviso ainda não estava na bandeja.
    }

    item.status = 'Cancelado';
    await gravar(arquivo);
    return { ok: true };
  });
}

export function observarPublicacaoLembretes() {
  return Notifications.addNotificationReceivedListener((notification) => {
    const id = Number(notification.request.content.data?.lembreteId);
    if (!Number.isFinite(id)) return;

    void emFila(async () => {
      const arquivo = await ler();
      const item = arquivo.itens.find((lembrete) => lembrete.id === id);
      if (!item || item.status !== 'Agendado') return;
      item.status = 'Publicado';
      await gravar(arquivo);
    });
  });
}
