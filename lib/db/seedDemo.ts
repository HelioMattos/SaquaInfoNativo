// Eventos de demonstracao.
//
// Serve para o app nascer com conteudo: lista cheia, marcadores espalhados no
// mapa e notas ja lancadas. Sem isso a primeira tela e o mapa aparecem vazios
// e nao da para testar nada sem cadastrar tudo a mao.
//
// Roda uma unica vez, e so quando a tabela de eventos esta vazia. Quem ja tem
// eventos salvos nunca ve esses dados. Para desligar de vez, troque a
// constante SEMEAR_DEMO abaixo para false.

import type * as SQLite from 'expo-sqlite';
import {
  CAPA_FEIRA,
  CAPA_IGREJA,
  CAPA_ITAUNA,
  CAPA_LAGOA,
  CAPA_MUTIRAO,
  CAPA_PRACA,
} from './capasDemo';

export const SEMEAR_DEMO = true;

interface EventoDemo {
  titulo: string;
  local: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
  /** Dias a partir de hoje. 0 = hoje. */
  dias: number;
  horaInicio: [number, number];
  horaTermino: [number, number];
  capa: string;
  /** Notas de 1 a 5 com o comentario que aparece no detalhe do evento. */
  avaliacoes?: { email: string; nota: number; mensagem: string }[];
}

// As coordenadas sao aproximadas, colocadas sobre os bairros de Saquarema para
// os marcadores ficarem espalhados dentro da regiao inicial do mapa. Para
// acertar o ponto exato de um evento, abra ele e toque no mapa da tela de
// edicao.
const EVENTOS_DEMO: EventoDemo[] = [
  {
    titulo: 'Etapa do circuito de surfe em Itauna',
    local: 'Praia de Itauna',
    descricao:
      'Baterias das categorias profissional e amadora na direita de Itauna. Arena montada na areia com locucao, praca de alimentacao e area de sombra para o publico. Em caso de mar pequeno a organizacao remarca para o dia seguinte.',
    categoria: 'Esportes',
    latitude: -22.934,
    longitude: -42.476,
    dias: 1,
    horaInicio: [8, 0],
    horaTermino: [17, 0],
    capa: CAPA_ITAUNA,
    avaliacoes: [
      { email: 'ana@exemplo.com', nota: 5, mensagem: 'Mar perfeito e organizacao impecavel.' },
      { email: 'bruno@exemplo.com', nota: 4, mensagem: 'Faltou sombra, mas valeu a pena.' },
    ],
  },
  {
    titulo: 'Mutirao de limpeza da praia',
    local: 'Praia do Boqueirao',
    descricao:
      'Encontro de voluntarios para recolher residuos na faixa de areia e no entorno do canal. Luvas e sacos sao distribuidos no ponto de encontro. Leve chapeu, agua e calcado fechado.',
    categoria: 'Outros',
    latitude: -22.93,
    longitude: -42.502,
    dias: 0,
    horaInicio: [7, 30],
    horaTermino: [11, 0],
    capa: CAPA_MUTIRAO,
  },
  {
    titulo: 'Novena de Nossa Senhora de Nazare',
    local: 'Igreja de Nossa Senhora de Nazare',
    descricao:
      'Novena rezada na igreja matriz, com coral e bencao ao final. A subida ate a capela tem escada e o estacionamento no entorno e limitado, entao chegue com antecedencia.',
    categoria: 'Religioso',
    latitude: -22.9265,
    longitude: -42.4895,
    dias: 3,
    horaInicio: [19, 0],
    horaTermino: [21, 0],
    capa: CAPA_IGREJA,
  },
  {
    titulo: 'Samba na praca do Centro',
    local: 'Praca do Centro de Saquarema',
    descricao:
      'Roda de samba com grupos da cidade e participacao de convidados. Palco montado na praca, entrada gratuita e barracas de comida em volta. Evento ao ar livre, sujeito a chuva.',
    categoria: 'Show',
    latitude: -22.9215,
    longitude: -42.508,
    dias: 5,
    horaInicio: [20, 0],
    horaTermino: [23, 30],
    capa: CAPA_PRACA,
    avaliacoes: [
      { email: 'carla@exemplo.com', nota: 4, mensagem: 'Som alto demais perto do palco.' },
    ],
  },
  {
    titulo: 'Caminhada fotografica na lagoa',
    local: 'Mirante da Lagoa de Saquarema',
    descricao:
      'Caminhada guiada pela orla da lagoa no fim da tarde, com paradas para fotografar as aves e o por do sol. Vagas limitadas. Pode ser feita com celular, nao precisa de camera.',
    categoria: 'Cultural',
    latitude: -22.9155,
    longitude: -42.478,
    dias: 8,
    horaInicio: [16, 0],
    horaTermino: [18, 30],
    capa: CAPA_LAGOA,
  },
  {
    titulo: 'Feira gastronomica de Bacaxa',
    local: 'Bacaxa',
    descricao:
      'Feira com produtores da regiao: peixe fresco, queijo, doces e cachaca artesanal. Tem area coberta com mesas e apresentacao de musica ao vivo no meio da tarde.',
    categoria: 'Comida',
    latitude: -22.888,
    longitude: -42.519,
    dias: 12,
    horaInicio: [11, 0],
    horaTermino: [20, 0],
    capa: CAPA_FEIRA,
    avaliacoes: [
      { email: 'diego@exemplo.com', nota: 5, mensagem: 'O peixe na brasa compensa a viagem.' },
      { email: 'ana@exemplo.com', nota: 3, mensagem: 'Fila grande nas barracas depois das 18h.' },
    ],
  },
];

/** Data a partir de hoje, no fuso do aparelho. */
function quando(dias: number, [hora, minuto]: [number, number]): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  data.setHours(hora, minuto, 0, 0);
  return data.toISOString();
}

export async function seedEventosDemo(db: SQLite.SQLiteDatabase): Promise<void> {
  if (!SEMEAR_DEMO) return;

  const existente = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM eventos'
  );
  if (existente && existente.total > 0) return;

  const agora = Date.now();

  for (let i = 0; i < EVENTOS_DEMO.length; i++) {
    const demo = EVENTOS_DEMO[i];
    const id = `demo_${i + 1}`;
    // Um segundo de diferenca entre eles mantem a ordem desta lista na tela
    // inicial, que ordena por criado_em desc.
    const criadoEm = new Date(agora - i * 1000).toISOString();

    await db.runAsync(
      `INSERT INTO eventos (
        id, titulo, local, descricao, categoria, latitude, longitude,
        data_inicio, data_termino, imagens, criado_em, atualizado_em, status_sync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      demo.titulo,
      demo.local,
      demo.descricao,
      demo.categoria,
      demo.latitude,
      demo.longitude,
      quando(demo.dias, demo.horaInicio),
      quando(demo.dias, demo.horaTermino),
      JSON.stringify([demo.capa]),
      criadoEm,
      criadoEm,
      'SINCRONIZADO'
    );

    for (const avaliacao of demo.avaliacoes ?? []) {
      await db.runAsync(
        `INSERT OR IGNORE INTO avaliacoes (evento_id, email, nota, mensagem, atualizado_em)
         VALUES (?, ?, ?, ?, ?)`,
        id,
        avaliacao.email,
        avaliacao.nota,
        avaliacao.mensagem,
        criadoEm
      );
    }
  }
}
