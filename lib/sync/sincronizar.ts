import type { ItemFila } from '../../types/sync';
import { atualizarStatusSync } from '../db/eventos';
import { enviarParaServidor } from './api';
import {
  atualizarStatusItem,
  obterPendentes,
  salvarUltimaSincronizacao,
} from './fila';

export interface ResultadoSync {
  fila: ItemFila[];
  enviados: number;
  falhas: number;
}

export async function sincronizarDados(): Promise<ResultadoSync> {
  const pendentes = await obterPendentes();
  let enviados = 0;
  let falhas = 0;
  let fila: ItemFila[] = [];

  for (const item of pendentes) {
    fila = await atualizarStatusItem(item.id, 'SINCRONIZANDO');

    try {
      await enviarParaServidor(item);
      fila = await atualizarStatusItem(item.id, 'SINCRONIZADO');
      if (item.operacao !== 'EXCLUIR') {
        await atualizarStatusSync(item.id, 'SINCRONIZADO');
      }
      enviados += 1;
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Falha ao sincronizar';
      fila = await atualizarStatusItem(item.id, 'PENDENTE', mensagem);
      if (item.operacao !== 'EXCLUIR') {
        await atualizarStatusSync(item.id, 'PENDENTE');
      }
      falhas += 1;
    }
  }

  if (enviados > 0) {
    await salvarUltimaSincronizacao(new Date().toISOString());
  }

  return { fila, enviados, falhas };
}
