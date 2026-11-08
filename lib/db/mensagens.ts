import type { Mensagem, MensagemInput } from '../../types/mensagem';
import { withDb } from './index';

interface MensagemRow {
  id: string;
  remetente_email: string;
  destinatario_email: string;
  conteudo: string;
  lida: number;
  criada_em: string;
}

function mapMensagem(row: MensagemRow): Mensagem {
  return {
    id: row.id,
    remetenteEmail: row.remetente_email,
    destinatarioEmail: row.destinatario_email,
    conteudo: row.conteudo,
    lida: row.lida === 1,
    criadaEm: row.criada_em,
  };
}

function gerarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listarMensagens(): Promise<Mensagem[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<MensagemRow>(
      'SELECT * FROM mensagens ORDER BY criada_em DESC'
    );

    return rows.map(mapMensagem);
  });
}

export async function enviarMensagem(
  remetenteEmail: string,
  dados: MensagemInput
): Promise<string> {
  return withDb(async (db) => {
    const id = gerarId();
    const agora = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO mensagens (
        id,
        remetente_email,
        destinatario_email,
        conteudo,
        lida,
        criada_em
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      remetenteEmail,
      dados.destinatarioEmail,
      dados.conteudo,
      0,
      agora
    );

    return id;
  });
}

export async function marcarComoLida(id: string): Promise<void> {
  await withDb(async (db) => {
    await db.runAsync(
      'UPDATE mensagens SET lida = 1 WHERE id = ?',
      id
    );
  });
}
export async function listarMensagensUsuario(
  email: string
): Promise<Mensagem[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<MensagemRow>(
      `SELECT *
       FROM mensagens
       WHERE destinatario_email = ?
       ORDER BY criada_em DESC`,
      email
    );

    return rows.map(mapMensagem);
  });
}
export async function excluirMensagem(
  id: string
): Promise<void> {
  await withDb(async (db) => {
    await db.runAsync(
      'DELETE FROM mensagens WHERE id = ?',
      id
    );
  });
}
