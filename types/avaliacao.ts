export const LEGENDAS_NOTA = ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Muito bom'] as const;

export interface Avaliacao {
  eventoId: string;
  email: string;
  nota: number;
  mensagem: string;
  atualizadoEm: string;
}

export interface ResumoAvaliacao {
  media: number;
  total: number;
  minhaNota: number | null;
  minhaMensagem: string;
  comentarios: Avaliacao[];
}

export interface PayloadAvaliacao {
  eventoId: string;
  email: string;
  nota: number;
  mensagem: string;
}
