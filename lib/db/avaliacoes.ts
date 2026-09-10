import type { Avaliacao, ResumoAvaliacao } from '../../types/avaliacao';
import { withDb } from './index';

interface AvaliacaoRow {
  evento_id: string;
  email: string;
  nota: number;
  mensagem: string | null;
  atualizado_em: string;
}

function mapAvaliacao(row: AvaliacaoRow): Avaliacao {
  return {
    eventoId: row.evento_id,
    email: row.email,
    nota: row.nota,
    mensagem: row.mensagem ?? '',
    atualizadoEm: row.atualizado_em,
  };
}

export async function salvarAvaliacao(params: {
  eventoId: string;
  email: string;
  nota: number;
  mensagem: string;
}): Promise<void> {
  await withDb(async (db) => {
    const agora = new Date().toISOString();
    const nota = Math.min(5, Math.max(1, Math.round(params.nota)));
    const mensagem = params.mensagem.trim();

    await db.runAsync(
      `INSERT INTO avaliacoes (evento_id, email, nota, mensagem, atualizado_em)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(evento_id, email) DO UPDATE SET
         nota = excluded.nota,
         mensagem = excluded.mensagem,
         atualizado_em = excluded.atualizado_em`,
      params.eventoId,
      params.email.toLowerCase().trim(),
      nota,
      mensagem,
      agora
    );
  });
}

export async function obterResumoAvaliacao(eventoId: string, email?: string | null): Promise<ResumoAvaliacao> {
  return withDb(async (db) => {
    const agregado = await db.getFirstAsync<{ media: number | null; total: number }>(
      'SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes WHERE evento_id = ?',
      eventoId
    );

    const comentarios = await db.getAllAsync<AvaliacaoRow>(
      `SELECT * FROM avaliacoes
       WHERE evento_id = ? AND TRIM(COALESCE(mensagem, '')) != ''
       ORDER BY atualizado_em DESC
       LIMIT 20`,
      eventoId
    );

    let minhaNota: number | null = null;
    let minhaMensagem = '';

    if (email) {
      const minha = await db.getFirstAsync<AvaliacaoRow>(
        'SELECT * FROM avaliacoes WHERE evento_id = ? AND email = ?',
        eventoId,
        email.toLowerCase().trim()
      );
      if (minha) {
        minhaNota = minha.nota;
        minhaMensagem = minha.mensagem ?? '';
      }
    }

    return {
      media: agregado?.media ? Number(agregado.media) : 0,
      total: agregado?.total ?? 0,
      minhaNota,
      minhaMensagem,
      comentarios: comentarios.map(mapAvaliacao),
    };
  });
}

export async function listarMediasAvaliacoes(): Promise<Record<string, { media: number; total: number }>> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<{ evento_id: string; media: number; total: number }>(
      'SELECT evento_id, AVG(nota) as media, COUNT(*) as total FROM avaliacoes GROUP BY evento_id'
    );

    const mapa: Record<string, { media: number; total: number }> = {};
    for (const row of rows) {
      mapa[row.evento_id] = { media: Number(row.media), total: row.total };
    }
    return mapa;
  });
}
