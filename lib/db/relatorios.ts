import { withDb } from './index';

export interface RelatorioAdmin {
  totalMensagens: number;
  totalFeedbacks: number;
  totalAvisos: number;
}

export async function obterRelatorio(): Promise<RelatorioAdmin> {
  return withDb(async (db) => {
    const mensagens = await db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) as total FROM mensagens'
    );

    const feedbacks = await db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) as total FROM feedbacks'
    );

    const avisos = await db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) as total FROM avisos_admin'
    );

    return {
      totalMensagens: mensagens?.total ?? 0,
      totalFeedbacks: feedbacks?.total ?? 0,
      totalAvisos: avisos?.total ?? 0,
    };
  });
}
