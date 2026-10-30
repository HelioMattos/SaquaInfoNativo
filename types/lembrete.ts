export type StatusLembrete = 'Agendado' | 'Publicado' | 'Cancelado';

export interface Lembrete {
  id: number;
  titulo: string;
  mensagem: string;
  quando: number;
  status: StatusLembrete;
  identificador: string;
  eventoId?: string;
}
