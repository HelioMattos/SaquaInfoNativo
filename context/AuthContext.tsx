import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  autenticarUsuario,
  encerrarSessao,
  obterSessaoAtual,
  registrarUsuario,
} from '../lib/db/users';
import type { UsuarioSessao } from '../types/usuario';

interface AuthContextValue {
  user: UsuarioSessao | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioSessao | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const sessao = await obterSessaoAtual();
    setUser(sessao);
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const sessao = await obterSessaoAtual();
        if (ativo) setUser(sessao);
      } finally {
        if (ativo) setLoading(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const sessao = await autenticarUsuario(email, senha);
    setUser(sessao);
  }, []);

  const register = useCallback(async (email: string, senha: string) => {
    await registrarUsuario(email, senha);
  }, []);

  const logout = useCallback(async () => {
    await encerrarSessao();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAdmin: user?.tipo === 'admin',
        loading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
