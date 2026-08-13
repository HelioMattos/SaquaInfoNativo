export interface Coordenada {
  latitude: number;
  longitude: number;
}

export interface PassoNavegacao {
  instrucao: string;
  instrucaoCurta: string;
  distanciaMetros: number;
  coordenada: Coordenada;
  nomeRua?: string;
}

export interface InfoRota {
  coordenadas: Coordenada[];
  distanciaMetros: number;
  duracaoSegundos: number;
  passos: PassoNavegacao[];
}

function traduzirManobra(type: string, modifier?: string): string {
  if (type === 'arrive') return 'Você chegou ao destino';
  if (type === 'depart') return 'Siga em frente';
  if (type === 'turn') {
    if (modifier === 'right') return 'Vire à direita';
    if (modifier === 'left') return 'Vire à esquerda';
    if (modifier === 'slight right') return 'Mantenha-se à direita';
    if (modifier === 'slight left') return 'Mantenha-se à esquerda';
    if (modifier === 'straight') return 'Siga em frente';
    if (modifier === 'uturn') return 'Faça retorno';
  }
  if (type === 'new name') return 'Continue em frente';
  if (type === 'merge') return 'Entre na via';
  if (type === 'roundabout') return 'Na rotatória, siga em frente';
  return 'Continue em frente';
}

function montarInstrucao(type: string, modifier: string | undefined, nomeRua?: string): string {
  const manobra = traduzirManobra(type, modifier);
  if (nomeRua && type !== 'arrive') {
    return `${manobra} na ${nomeRua}`;
  }
  return manobra;
}

function parsePassos(steps: any[]): PassoNavegacao[] {
  return steps.map((step) => {
    const [lng, lat] = step.maneuver.location;
    const type = step.maneuver.type;
    const modifier = step.maneuver.modifier;
    const nomeRua = step.name || undefined;

    return {
      instrucao: montarInstrucao(type, modifier, nomeRua),
      instrucaoCurta: traduzirManobra(type, modifier),
      distanciaMetros: step.distance,
      coordenada: { latitude: lat, longitude: lng },
      nomeRua,
    };
  });
}

export async function buscarRota(
  origem: Coordenada,
  destino: Coordenada
): Promise<InfoRota | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}` +
      `?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.[0]) return null;

    const route = data.routes[0];
    const coordenadas: Coordenada[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lng,
      })
    );

    const steps = route.legs?.[0]?.steps || [];
    const passos = parsePassos(steps);

    return {
      coordenadas,
      distanciaMetros: route.distance,
      duracaoSegundos: route.duration,
      passos: passos.length > 0 ? passos : [
        {
          instrucao: 'Siga em frente até o destino',
          instrucaoCurta: 'Siga em frente',
          distanciaMetros: route.distance,
          coordenada: destino,
        },
        {
          instrucao: 'Você chegou ao destino',
          instrucaoCurta: 'Chegou ao destino',
          distanciaMetros: 0,
          coordenada: destino,
        },
      ],
    };
  } catch {
    return null;
  }
}

export function distanciaEntre(a: Coordenada, b: Coordenada): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}

export function formatarDuracao(segundos: number): string {
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
