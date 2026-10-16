export type TipoUsuario = 'admin' | 'usuario';

export interface Usuario {
  email: string;
  tipo: TipoUsuario;
  criadoEm: string;
}

export interface UsuarioSessao {
  email: string;
  tipo: TipoUsuario;
}
