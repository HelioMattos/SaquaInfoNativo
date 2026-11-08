import type { Feedback, FeedbackInput } from '../../types/feedback';
import { withDb } from './index';

interface FeedbackRow {
  id: string;
  usuario_email: string;
  nota: number;
  mensagem: string;
  criado_em: string;
}

function mapFeedback(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    usuarioEmail: row.usuario_email,
    nota: row.nota,
    mensagem: row.mensagem,
    criadoEm: row.criado_em,
  };
}

function gerarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listarFeedbacks(): Promise<Feedback[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<FeedbackRow>(
      'SELECT * FROM feedbacks ORDER BY criado_em DESC'
    );

    return rows.map(mapFeedback);
  });
}

export async function criarFeedback(
  usuarioEmail: string,
  dados: FeedbackInput
): Promise<string> {
  return withDb(async (db) => {
    const id = gerarId();
    const agora = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO feedbacks (
        id,
        usuario_email,
        nota,
        mensagem,
        criado_em
      ) VALUES (?, ?, ?, ?, ?)`,
      id,
      usuarioEmail,
      dados.nota,
      dados.mensagem,
      agora
    );

    return id;
  });
}