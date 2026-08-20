import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UsuarioSessao } from '../../types/usuario';

const SESSION_KEY = '@saquainfo/session';

export async function salvarSessao(usuario: UsuarioSessao): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

export async function carregarSessao(): Promise<UsuarioSessao | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as UsuarioSessao;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function limparSessao(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
