export type StatusLembrete = 'AGENDADO' | 'DISPARADO' | 'CANCELADO';

export interface Lembrete {
  id: string;
  titulo: string;
  mensagem: string;
  /** Instante absoluto do disparo, em milissegundos desde epoch. */
  quando: number;
  status: StatusLembrete;
  eventoId?: string;
  notificacaoId?: string;
}

export interface LembreteInput {
  titulo: string;
  mensagem: string;
  quando: Date;
  eventoId?: string;
}

export const ROTULO_STATUS_LEMBRETE: Record<StatusLembrete, string> = {
  AGENDADO: 'Agendado',
  DISPARADO: 'Disparado',
  CANCELADO: 'Cancelado',
};
