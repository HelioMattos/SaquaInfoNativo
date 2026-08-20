import type { TipoUsuario, Usuario, UsuarioSessao } from '../../types/usuario';
import { hashSenha, verificarSenha } from '../auth/password';
import { carregarSessao, limparSessao, salvarSessao } from '../auth/session';
import { getDb } from './index';

interface UsuarioRow {
  email: string;
  senha_hash: string;
  tipo: TipoUsuario;
  criado_em: string;
}

function mapUsuario(row: UsuarioRow): Usuario {
  return {
    email: row.email,
    tipo: row.tipo,
    criadoEm: row.criado_em,
  };
}

function normalizarEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function registrarUsuario(email: string, senha: string): Promise<void> {
  const db = await getDb();
  const emailNormalizado = normalizarEmail(email);

  const existente = await db.getFirstAsync<{ email: string }>(
    'SELECT email FROM usuarios WHERE email = ?',
    emailNormalizado
  );

  if (existente) {
    throw new Error('E-mail já cadastrado.');
  }

  const agora = new Date().toISOString();
  const senhaHash = await hashSenha(senha);

  await db.runAsync(
    'INSERT INTO usuarios (email, senha_hash, tipo, criado_em) VALUES (?, ?, ?, ?)',
    emailNormalizado,
    senhaHash,
    'usuario',
    agora
  );
}

export async function autenticarUsuario(email: string, senha: string): Promise<UsuarioSessao> {
  const db = await getDb();
  const emailNormalizado = normalizarEmail(email);

  const row = await db.getFirstAsync<UsuarioRow>(
    'SELECT email, senha_hash, tipo, criado_em FROM usuarios WHERE email = ?',
    emailNormalizado
  );

  if (!row) {
    throw new Error('Usuário ou senha incorretos.');
  }

  const senhaValida = await verificarSenha(senha, row.senha_hash);
  if (!senhaValida) {
    throw new Error('Usuário ou senha incorretos.');
  }

  const sessao: UsuarioSessao = { email: row.email, tipo: row.tipo };
  await salvarSessao(sessao);
  return sessao;
}

export async function obterUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<UsuarioRow>(
    'SELECT email, senha_hash, tipo, criado_em FROM usuarios WHERE email = ?',
    normalizarEmail(email)
  );

  return row ? mapUsuario(row) : null;
}

export async function obterSessaoAtual(): Promise<UsuarioSessao | null> {
  const sessao = await carregarSessao();
  if (!sessao?.email) return null;

  const usuario = await obterUsuarioPorEmail(sessao.email);
  if (!usuario) {
    await limparSessao();
    return null;
  }

  return { email: usuario.email, tipo: usuario.tipo };
}

export async function encerrarSessao(): Promise<void> {
  await limparSessao();
}
