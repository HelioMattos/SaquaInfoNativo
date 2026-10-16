export function getEmojiCategoria(categoria?: string) {
  switch (categoria) {
    case 'Esportes':
      return '🏃';
    case 'Show':
      return '🎤';
    case 'Comida':
      return '👨‍🍳';
    case 'Religioso':
      return '🙏';
    case 'Cultural':
      return '📖';
    default:
      return '📍';
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
  const emoji = getEmojiCategoria(categoria);

  return L.divIcon({
    className: '',
    html: `<div style="
      width:40px;
      height:40px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:22px;
      line-height:1;
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 1px 2px rgba(0,0,0,0.45));
    ">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
}
