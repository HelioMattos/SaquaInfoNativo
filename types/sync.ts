import type { EventoInput, StatusSync } from './evento';

export type { StatusSync };

export type TipoOperacao = 'CRIAR' | 'ATUALIZAR' | 'EXCLUIR';

export interface ItemFila {
  id: string;
  operacao: TipoOperacao;
  descricao: string;
  payload: EventoInput | null;
  status: StatusSync;
  criadoEm: string;
  atualizadoEm: string;
  erro?: string;
}

export type FaseConexao = 'offline' | 'conectado' | 'sincronizando' | 'concluido';
