import { Linking, Platform } from 'react-native';

function textoIntent(valor: string) {
  return valor.replace(/[;#=%]/g, ' ').trim().slice(0, 180);
}

export async function salvarLembreteNaAgenda(entrada: {
  titulo: string;
  mensagem: string;
  quando: Date;
}): Promise<{ ok: true; agendaId: string } | { ok: false; mensagem: string }> {
  if (Platform.OS !== 'android') {
    return { ok: false, mensagem: 'A agenda do celular está disponível no Android.' };
  }

  const inicio = entrada.quando.getTime();
  const fim = inicio + 30 * 60 * 1000;
  const url = [
    'intent:#Intent',
    'action=android.intent.action.INSERT',
    'type=vnd.android.cursor.item/event',
    `S.title=${textoIntent(entrada.titulo)}`,
    `S.description=${textoIntent(entrada.mensagem)}`,
    `l.beginTime=${inicio}`,
    `l.endTime=${fim}`,
    'S.eventTimezone=America/Sao_Paulo',
    'end',
  ].join(';');

  try {
    await Linking.openURL(url);
    return { ok: true, agendaId: `agenda-${inicio}` };
  } catch {
    return {
      ok: false,
      mensagem: 'O lembrete ficou no SaquaInfo, mas a agenda do celular não abriu.',
    };
  }
}

export async function removerLembreteDaAgenda(_agendaId: string) {
  // O evento fica no aplicativo de agenda depois que a pessoa confirma o salvamento.
}
