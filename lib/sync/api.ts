import type { ItemFila } from '../../types/sync';

const ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';
const TIMEOUT_MS = 10000;

/**
 * Envia um item da fila ao servidor. A requisição HTTP real falha no Modo Avião
 * e só confirma sucesso quando há conexão — o dado local nunca é apagado aqui.
 */
export async function enviarParaServidor(item: ItemFila): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        titulo: item.descricao,
        operacao: item.operacao,
        payload: item.payload,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Servidor retornou ${response.status}`);
    }
  } catch (erro) {
    if (erro instanceof Error && erro.name === 'AbortError') {
      throw new Error('Tempo de espera esgotado ao enviar o dado.');
    }
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}
