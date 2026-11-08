import type { AvisoAdmin } from '../../types/avisoAdmin';
import { withDb } from './index';

interface AvisoAdminRow {
  id: string;
  titulo: string;
  mensagem: string;
  criado_em: string;
}

function mapAviso(row: AvisoAdminRow): AvisoAdmin {
  return {
    id: row.id,
    titulo: row.titulo,
    mensagem: row.mensagem,
    criadoEm: row.criado_em,
  };
}

export async function listarAvisos(): Promise<AvisoAdmin[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<AvisoAdminRow>(
      'SELECT * FROM avisos_admin ORDER BY criado_em DESC'
    );

    return rows.map(mapAviso);
  });
}