import bcrypt from 'bcryptjs';

const ROUNDS = 8;

bcrypt.setRandomFallback((len: number) => {
  const bytes: number[] = [];
  for (let i = 0; i < len; i += 1) {
    bytes.push(Math.floor(Math.random() * 256));
  }
  return bytes;
});

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hashSync(senha, ROUNDS);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compareSync(senha, hash);
}
