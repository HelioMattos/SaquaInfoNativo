export interface FeedbackInput {
  nota: number;
  mensagem: string;
}

export interface Feedback {
  id: string;
  usuarioEmail: string;
  nota: number;
  mensagem: string;
  criadoEm: string;
}
