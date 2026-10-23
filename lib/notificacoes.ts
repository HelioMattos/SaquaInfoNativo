import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import type { Lembrete, LembreteInput } from '../types/lembrete';
import {
  atualizarStatusLembrete,
  gerarIdLembrete,
  listarLembretes,
  marcarLembreteDisparado,
  salvarLembrete,
} from './db/lembretes';

export { marcarLembreteDisparado };

export const CANAL_LEMBRETES = 'lembretes';

export type EstadoPermissaoNotificacoes = 'concedida' | 'pendente' | 'bloqueada' | 'canal-bloqueado';

export class ErroLembrete extends Error {}

export function configurarNotificacoes() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    // Recriar o canal é seguro: o Android mantém o que o usuário escolheu nas configurações.
    Notifications.setNotificationChannelAsync(CANAL_LEMBRETES, {
      name: 'Lembretes de eventos',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => undefined);
  }
}

export async function verificarPermissaoNotificacoes(): Promise<EstadoPermissaoNotificacoes> {
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  if (!granted) return canAskAgain ? 'pendente' : 'bloqueada';

  if (Platform.OS === 'android') {
    const canal = await Notifications.getNotificationChannelAsync(CANAL_LEMBRETES);
    if (canal && canal.importance === Notifications.AndroidImportance.NONE) return 'canal-bloqueado';
  }
  return 'concedida';
}

/** Pede a permissão uma única vez; se o Android não mostrar mais a janela, o usuário vai às configurações. */
export async function pedirPermissaoNotificacoes(): Promise<EstadoPermissaoNotificacoes> {
  const atual = await verificarPermissaoNotificacoes();
  if (atual !== 'pendente') return atual;

  await Notifications.requestPermissionsAsync();
  return verificarPermissaoNotificacoes();
}

export function abrirConfiguracoesNotificacoes() {
  Linking.openSettings();
}

export function mensagemPermissao(estado: EstadoPermissaoNotificacoes): string {
  if (estado === 'canal-bloqueado') {
    return 'O canal "Lembretes de eventos" está desativado. Ative-o nas configurações do aplicativo.';
  }
  if (estado === 'bloqueada') {
    return 'As notificações do SaquaInfo estão bloqueadas. Libere-as nas configurações do aparelho.';
  }
  return 'Toque em "Permitir notificações" para receber os lembretes.';
}

export function validarLembrete(input: LembreteInput, agora: number = Date.now()): string | null {
  if (!input.titulo.trim()) return 'Informe o título do lembrete.';
  if (!input.mensagem.trim()) return 'Informe a mensagem do lembrete.';
  if (isNaN(input.quando.getTime())) return 'Escolha uma data e hora válidas.';
  if (input.quando.getTime() <= agora) return 'Escolha uma data e hora no futuro.';
  return null;
}

async function exigirPermissao() {
  const estado = await verificarPermissaoNotificacoes();
  if (estado !== 'concedida') throw new ErroLembrete(mensagemPermissao(estado));
}

export async function agendarLembrete(input: LembreteInput): Promise<Lembrete> {
  const erro = validarLembrete(input);
  if (erro) throw new ErroLembrete(erro);

  await exigirPermissao();

  const id = gerarIdLembrete();
  const titulo = input.titulo.trim();
  const mensagem = input.mensagem.trim();

  const notificacaoId = await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: titulo,
      body: mensagem,
      data: { lembreteId: id, eventoId: input.eventoId ?? null },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.quando,
      channelId: CANAL_LEMBRETES,
    },
  });

  const lembrete: Lembrete = {
    id,
    titulo,
    mensagem,
    quando: input.quando.getTime(),
    status: 'AGENDADO',
    eventoId: input.eventoId,
    notificacaoId,
  };

  try {
    await salvarLembrete(lembrete);
  } catch (erroSalvar) {
    // Não deixa alarme órfão se o registro não foi gravado.
    await Notifications.cancelScheduledNotificationAsync(notificacaoId).catch(() => undefined);
    throw erroSalvar;
  }

  return lembrete;
}

export async function cancelarLembrete(lembrete: Lembrete): Promise<void> {
  if (lembrete.notificacaoId) {
    await Notifications.cancelScheduledNotificationAsync(lembrete.notificacaoId).catch(() => undefined);
    await Notifications.dismissNotificationAsync(lembrete.notificacaoId).catch(() => undefined);
  }
  await atualizarStatusLembrete(lembrete.id, 'CANCELADO');
}

export async function testarNotificacaoAgora(): Promise<void> {
  await exigirPermissao();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SaquaInfo',
      body: 'Teste de notificação: o canal de lembretes está funcionando.',
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_LEMBRETES } : null,
  });
}

/**
 * Lê os lembretes e marca como DISPARADO os agendados cujo horário passou e que o sistema
 * não tem mais na fila (a notificação já foi entregue enquanto o app estava fechado).
 */
export async function listarLembretesAtualizados(): Promise<Lembrete[]> {
  const lembretes = await listarLembretes();
  const agendados = await Notifications.getAllScheduledNotificationsAsync();
  const idsNaFila = new Set(agendados.map((item) => item.identifier));
  const agora = Date.now();

  for (const lembrete of lembretes) {
    if (lembrete.status !== 'AGENDADO' || lembrete.quando > agora) continue;
    if (lembrete.notificacaoId && idsNaFila.has(lembrete.notificacaoId)) continue;
    await marcarLembreteDisparado(lembrete.id);
    lembrete.status = 'DISPARADO';
  }

  return lembretes;
}
