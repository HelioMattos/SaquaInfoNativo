import * as SQLite from 'expo-sqlite';
import { hashSenha } from '../auth/password';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let filaOperacoes: Promise<unknown> = Promise.resolve();
let forcarNovaConexao = false;

const CREATE_USUARIOS = `
  CREATE TABLE IF NOT EXISTS usuarios (
    email TEXT PRIMARY KEY NOT NULL,
    senha_hash TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'usuario',
    criado_em TEXT NOT NULL
  );
`;

const CREATE_EVENTOS = `
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
    atualizado_em TEXT NOT NULL,
    status_sync TEXT NOT NULL DEFAULT 'SINCRONIZADO'
  );
`;

const CREATE_AVALIACOES = `
  CREATE TABLE IF NOT EXISTS avaliacoes (
    evento_id TEXT NOT NULL,
    email TEXT NOT NULL,
    nota INTEGER NOT NULL,
    mensagem TEXT,
    atualizado_em TEXT NOT NULL,
    PRIMARY KEY (evento_id, email)
  );
`;

function ehConexaoMorta(erro: unknown): boolean {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  return (
    mensagem.includes('NativeDatabase') ||
    mensagem.includes('prepareAsync') ||
    mensagem.includes('NullPointerException') ||
    mensagem.includes('NullPointer') ||
    mensagem.includes('database is closed') ||
    mensagem.includes('native database')
  );
}

async function migrarSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync(
      "ALTER TABLE eventos ADD COLUMN status_sync TEXT NOT NULL DEFAULT 'SINCRONIZADO'"
    );
  } catch {
    // coluna já existe em bancos criados após o desafio Offline First
  }

  await db.execAsync(CREATE_AVALIACOES);
}

async function seedAdmin(db: SQLite.SQLiteDatabase): Promise<void> {
  const existente = await db.getFirstAsync<{ email: string }>(
    'SELECT email FROM usuarios WHERE email = ?',
    'admin@saquainfo.com'
  );
  if (existente) return;

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

async function initDb(novaConexao: boolean): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('saquainfo.db', {
    useNewConnection: novaConexao,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA busy_timeout = 5000;');
  await db.execAsync(CREATE_USUARIOS);
  await db.execAsync(CREATE_EVENTOS);
  await db.execAsync(CREATE_AVALIACOES);
  await migrarSchema(db);
  await seedAdmin(db);
  return db;
}

async function resetarDb(): Promise<void> {
  const antigo = dbInstance;
  dbInstance = null;
  initPromise = null;
  forcarNovaConexao = true;
  if (!antigo) return;
  try {
    await antigo.closeAsync();
  } catch {
    // handle nativo já inválido após Fast Refresh
  }
}

async function abrirDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  if (!initPromise) {
    const novaConexao = forcarNovaConexao;
    forcarNovaConexao = false;
    initPromise = initDb(novaConexao)
      .then((db) => {
        dbInstance = db;
        return db;
      })
      .catch((erro) => {
        initPromise = null;
        dbInstance = null;
        throw erro;
      });
  }

  return initPromise;
}

export async function withDb<T>(operacao: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  const executar = async (): Promise<T> => {
    try {
      const db = await abrirDb();
      return await operacao(db);
    } catch (erro) {
      if (!ehConexaoMorta(erro)) throw erro;
      await resetarDb();
      const db = await abrirDb();
      return await operacao(db);
    }
  };

  const resultado = filaOperacoes.then(executar, executar);
  filaOperacoes = resultado.then(
    () => undefined,
    () => undefined
  );
  return resultado;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  return withDb(async (db) => db);
}
