export const ZOOM_PADRAO = 15;

export function projetar(latitude: number, longitude: number, zoom: number) {
  const n = 2 ** zoom;
  const x = ((longitude + 180) / 360) * n;
  const latRad = (latitude * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

export function desprojetar(x: number, y: number, zoom: number) {
  const n = 2 ** zoom;
  const longitude = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  return { latitude: (latRad * 180) / Math.PI, longitude };
}

export function urlTile(x: number, y: number, zoom: number, fonte: 'carto' | 'esri' = 'carto') {
  const max = 2 ** zoom;
  const xx = ((Math.floor(x) % max) + max) % max;
  const yy = Math.min(Math.max(Math.floor(y), 0), max - 1);
  if (fonte === 'esri') {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${yy}/${xx}`;
  }
  return `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${xx}/${yy}.png`;
}

export function tilesVisiveis(
  latitude: number,
  longitude: number,
  zoom: number,
  fonte: 'carto' | 'esri' = 'carto'
) {
  const centro = projetar(latitude, longitude, zoom);
  const origemX = Math.floor(centro.x) - 1;
  const origemY = Math.floor(centro.y) - 1;
  const tiles = [];
  for (let linha = 0; linha < 3; linha += 1) {
    for (let coluna = 0; coluna < 3; coluna += 1) {
      const x = origemX + coluna;
      const y = origemY + linha;
      tiles.push({
        key: `${fonte}-${x}-${y}`,
        url: urlTile(x, y, zoom, fonte),
      });
    }
  }
  return { tiles, origemX, origemY, centro };
}

export function pontoNoMapa(
  latitude: number,
  longitude: number,
  origemX: number,
  origemY: number,
  zoom: number,
  largura: number,
  altura: number
) {
  const ponto = projetar(latitude, longitude, zoom);
  return {
    left: ((ponto.x - origemX) / 3) * largura,
    top: ((ponto.y - origemY) / 3) * altura,
  };
}
