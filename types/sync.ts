import type { EventoInput, StatusSync } from './evento';
import type { PayloadAvaliacao } from './avaliacao';

export type { StatusSync };

export type TipoOperacao = 'CRIAR' | 'ATUALIZAR' | 'EXCLUIR' | 'AVALIAR';

export type PayloadFila = EventoInput | PayloadAvaliacao | null;

export interface ItemFila {
  id: string;
  operacao: TipoOperacao;
  descricao: string;
  payload: PayloadFila;
  status: StatusSync;
  criadoEm: string;
  atualizadoEm: string;
  erro?: string;
}

export type FaseConexao = 'offline' | 'conectado' | 'sincronizando' | 'concluido';
