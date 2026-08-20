import type { Evento } from '../../types/evento';
import { getDb } from './index';

interface EventoRow {
  id: string;
  titulo: string;
  local: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
  data_inicio: string;
  data_termino: string;
  imagens: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface EventoInput {
  titulo: string;
  local: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
  dataInicio: string;
  dataTermino: string;
  imagens: string[];
}

function mapEvento(row: EventoRow): Evento {
  let imagens: string | string[] | undefined;

  if (row.imagens) {
    try {
      const parsed = JSON.parse(row.imagens);
      imagens = Array.isArray(parsed) ? parsed : row.imagens;
    } catch {
      imagens = row.imagens;
    }
  }

  return {
    id: row.id,
    titulo: row.titulo,
    local: row.local,
    descricao: row.descricao,
    categoria: row.categoria,
    latitude: row.latitude,
    longitude: row.longitude,
    dataInicio: row.data_inicio,
    dataTermino: row.data_termino,
    imagens,
  };
}

function gerarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listarEventos(): Promise<Evento[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<EventoRow>(
    'SELECT * FROM eventos ORDER BY criado_em DESC'
  );
  return rows.map(mapEvento);
}

export async function obterEventoPorId(id: string): Promise<Evento | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<EventoRow>('SELECT * FROM eventos WHERE id = ?', id);
  return row ? mapEvento(row) : null;
}

export async function criarEvento(dados: EventoInput): Promise<string> {
  const db = await getDb();
  const agora = new Date().toISOString();
  const id = gerarId();

  await db.runAsync(
    `INSERT INTO eventos (
      id, titulo, local, descricao, categoria, latitude, longitude,
      data_inicio, data_termino, imagens, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    dados.titulo,
    dados.local,
    dados.descricao,
    dados.categoria,
    dados.latitude,
    dados.longitude,
    dados.dataInicio,
    dados.dataTermino,
    JSON.stringify(dados.imagens),
    agora,
    agora
  );

  return id;
}

export async function atualizarEvento(id: string, dados: EventoInput): Promise<void> {
  const db = await getDb();
  const agora = new Date().toISOString();

  const result = await db.runAsync(
    `UPDATE eventos SET
      titulo = ?, local = ?, descricao = ?, categoria = ?,
      latitude = ?, longitude = ?, data_inicio = ?, data_termino = ?,
      imagens = ?, atualizado_em = ?
    WHERE id = ?`,
    dados.titulo,
    dados.local,
    dados.descricao,
    dados.categoria,
    dados.latitude,
    dados.longitude,
    dados.dataInicio,
    dados.dataTermino,
    JSON.stringify(dados.imagens),
    agora,
    id
  );

  if (result.changes === 0) {
    throw new Error('Evento não encontrado.');
  }
}

export async function excluirEvento(id: string): Promise<void> {
  const db = await getDb();
  const result = await db.runAsync('DELETE FROM eventos WHERE id = ?', id);

  if (result.changes === 0) {
    throw new Error('Evento não encontrado.');
  }
}
