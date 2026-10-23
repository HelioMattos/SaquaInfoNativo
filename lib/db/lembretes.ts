import type { Lembrete, StatusLembrete } from '../../types/lembrete';
import { withDb } from './index';

interface LembreteRow {
  id: string;
  titulo: string;
  mensagem: string;
  quando: number;
  status: string;
  evento_id: string | null;
  notificacao_id: string | null;
}

function mapLembrete(row: LembreteRow): Lembrete {
  return {
    id: row.id,
    titulo: row.titulo,
    mensagem: row.mensagem,
    quando: row.quando,
    status: row.status as StatusLembrete,
    eventoId: row.evento_id ?? undefined,
    notificacaoId: row.notificacao_id ?? undefined,
  };
}

export function gerarIdLembrete(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `lmb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listarLembretes(): Promise<Lembrete[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<LembreteRow>('SELECT * FROM lembretes ORDER BY quando DESC');
    return rows.map(mapLembrete);
  });
}

export async function salvarLembrete(lembrete: Lembrete): Promise<void> {
  await withDb((db) =>
    db.runAsync(
      `INSERT INTO lembretes (id, titulo, mensagem, quando, status, evento_id, notificacao_id, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      lembrete.id,
      lembrete.titulo,
      lembrete.mensagem,
      lembrete.quando,
      lembrete.status,
      lembrete.eventoId ?? null,
      lembrete.notificacaoId ?? null,
      new Date().toISOString()
    )
  );
}

/** Um lembrete cancelado não volta a aparecer como disparado. */
export async function marcarLembreteDisparado(id: string): Promise<void> {
  await withDb((db) =>
    db.runAsync("UPDATE lembretes SET status = 'DISPARADO' WHERE id = ? AND status = 'AGENDADO'", id)
  );
}

export async function atualizarStatusLembrete(id: string, status: StatusLembrete): Promise<void> {
  await withDb((db) => db.runAsync('UPDATE lembretes SET status = ? WHERE id = ?', status, id));
}
