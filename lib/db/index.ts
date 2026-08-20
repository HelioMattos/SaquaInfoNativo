import * as SQLite from 'expo-sqlite';
import { hashSenha } from '../auth/password';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS usuarios (
    email TEXT PRIMARY KEY NOT NULL,
    senha_hash TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'usuario',
    criado_em TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS eventos (
    id TEXT PRIMARY KEY NOT NULL,
    titulo TEXT NOT NULL,
    local TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Outros',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    data_inicio TEXT NOT NULL,
    data_termino TEXT NOT NULL,
    imagens TEXT,
    criado_em TEXT NOT NULL,
    atualizado_em TEXT NOT NULL
  );
`;

async function seedAdmin(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) as total FROM usuarios');
  if ((row?.total ?? 0) > 0) return;

  const agora = new Date().toISOString();
  const senhaHash = await hashSenha('admin123');

  await db.runAsync(
    'INSERT INTO usuarios (email, senha_hash, tipo, criado_em) VALUES (?, ?, ?, ?)',
    'admin@saquainfo.com',
    senhaHash,
    'admin',
    agora
  );
}

async function initDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('saquainfo.db');
  await db.execAsync(SCHEMA);
  await seedAdmin(db);
  return db;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  if (!initPromise) {
    initPromise = initDb().then((db) => {
      dbInstance = db;
      return db;
    });
  }

  return initPromise;
}
