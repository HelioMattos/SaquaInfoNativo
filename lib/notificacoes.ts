import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export const CANAL_LEMBRETES = 'lembretes-eventos';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type ResultadoNotificacao = { ok: true } | { ok: false; mensagem: string };

export async function garantirCanalLembretes() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CANAL_LEMBRETES, {
    name: 'Lembretes de eventos',
    description: 'Avisos locais sobre eventos de Saquarema que você escolher lembrar.',
    importance: Notifications.AndroidImportance.DEFAULT,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    vibrationPattern: [0, 250, 250, 250],
  });
}

async function permissoesLiberadas() {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;

  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export async function prepararNotificacaoLocal(): Promise<ResultadoNotificacao> {
  if (Platform.OS !== 'android') {
    return {
      ok: false,
      mensagem: 'O lembrete local desta aula funciona no Android.',
    };
  }

  await garantirCanalLembretes();

  const liberada = await permissoesLiberadas();
  if (!liberada) {
    return {
      ok: false,
      mensagem:
        'As notificações estão bloqueadas. Abra as configurações do app e permita avisos do SaquaInfo. Nenhum lembrete de evento foi criado.',
    };
  }

  const canal = await Notifications.getNotificationChannelAsync(CANAL_LEMBRETES);
  if (!canal || canal.importance === Notifications.AndroidImportance.NONE) {
    return {
      ok: false,
      mensagem:
        'O canal Lembretes de eventos está desativado. Ative-o nas configurações do app. Nenhum lembrete de evento foi criado.',
    };
  }

  return { ok: true };
}

export async function testarNotificacaoAgora(): Promise<ResultadoNotificacao> {
  const pronto = await prepararNotificacaoLocal();
  if (!pronto.ok) return pronto;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SaquaInfo',
      body: 'Canal de lembretes de eventos ativo. Este aviso é só um teste.',
      data: { origem: 'teste-imediato' },
    },
    trigger: { channelId: CANAL_LEMBRETES },
  });

  return { ok: true };
}

export function abrirConfiguracoesNotificacao() {
  return Linking.openSettings();
}
