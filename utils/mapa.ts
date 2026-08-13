export function getIconeCategoria(categoria?: string) {
  switch (categoria) {
    case 'Esportes':
      return 'fitness';
    case 'Show':
      return 'mic';
    case 'Comida':
      return 'fast-food';
    case 'Religioso':
      return 'bonfire';
    case 'Cultural':
      return 'library';
    default:
      return 'location';
  }
}

export function configurarIconesLeaflet(L: typeof import('leaflet')) {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

export function criarIconeEventoLeaflet(L: typeof import('leaflet'), categoria?: string) {
  const icones: Record<string, string> = {
    Esportes: '⚽',
    Show: '🎵',
    Comida: '🍽️',
    Religioso: '🔥',
    Cultural: '📚',
  };

  const emoji = icones[categoria || ''] || '📍';

  return L.divIcon({
    className: '',
    html: `<div style="
      background:#007bff;
      border:2px solid #fff;
      border-radius:50%;
      width:34px;
      height:34px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:16px;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}
