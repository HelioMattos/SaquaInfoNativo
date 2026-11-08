export interface MensagemInput {
  destinatarioEmail: string;
  conteudo: string;
}

export interface Mensagem {
  id: string;
  remetenteEmail: string;
  destinatarioEmail: string;
  conteudo: string;
  lida: boolean;
  criadaEm: string;
}