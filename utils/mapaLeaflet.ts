// Monta o documento HTML do mapa que roda dentro do WebView.
//
// Usamos Leaflet com os tiles do OpenStreetMap: nao exige chave de API nem
// conta de faturamento, diferente da Maps SDK for Android usada pelo
// react-native-maps. O mesmo desenho ja era usado nas versoes `.web.tsx`
// destes componentes.
//
// O documento expoe `window.SaquaMapa` para o lado React controlar o mapa por
// `injectJavaScript`, e manda eventos de volta por `ReactNativeWebView.postMessage`.

export const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
export const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
export const TILES_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ATRIBUICAO_OSM = '&copy; OpenStreetMap';

/** Mensagens que o mapa manda para o lado React. */
export type MensagemMapa =
  | { tipo: 'pronto' }
  | { tipo: 'sem-leaflet' }
  | { tipo: 'clique'; latitude: number; longitude: number }
  | { tipo: 'movimento'; latitudeDelta: number; longitudeDelta: number }
  | { tipo: 'marcador'; id: string };

export interface OpcoesHtmlMapa {
  /** Centro inicial do mapa. */
  latitude: number;
  longitude: number;
  /** Zoom inicial (13 ~ cidade, 15 ~ bairro, 16 ~ rua). */
  zoom: number;
  /** Aplica o filtro de inversao nos tiles, como na versao web. */
  isDark?: boolean;
  /** Mostra o cursor de cruz (telas em que o toque escolhe a coordenada). */
  cursorCruz?: boolean;
  /** CSS adicional injetado no <style>. */
  cssExtra?: string;
}

export function montarHtmlMapa({
  latitude,
  longitude,
  zoom,
  isDark = false,
  cursorCruz = false,
  cssExtra = '',
}: OpcoesHtmlMapa): string {
  const corFundo = isDark ? '#121212' : '#ffffff';
  const corAviso = isDark ? '#aaa' : '#666';
  const cssCursor = cursorCruz ? '.leaflet-container { cursor: crosshair !important; }' : '';
  const cssEscuro = isDark
    ? '.leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }'
    : '';

  return [
    '<!DOCTYPE html>',
    '<html lang="pt-br">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />',
    '  <link rel="stylesheet" href="' + LEAFLET_CSS + '" />',
    '  <script src="' + LEAFLET_JS + '"></script>',
    '  <style>',
    '    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }',
    '    body { background: ' + corFundo + '; }',
    '    ' + cssCursor,
    '    ' + cssEscuro,
    '    .pin-area { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: transparent; }',
    '    .pin-evento {',
    '      font-size: 22px;',
    '      line-height: 1;',
    '      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 1px 2px rgba(0,0,0,0.45));',
    '      transform-origin: center center;',
    '      transition: transform 0.15s ease;',
    '    }',
    '    .pin-destacado .pin-evento { transform: scale(1.55); }',
    '    #aviso {',
    '      display: none;',
    '      position: absolute;',
    '      inset: 0;',
    '      align-items: center;',
    '      justify-content: center;',
    '      padding: 24px;',
    '      text-align: center;',
    '      font-family: sans-serif;',
    '      font-size: 14px;',
    '      color: ' + corAviso + ';',
    '    }',
    '    ' + cssExtra,
    '  </style>',
    '</head>',
    '<body>',
    '  <div id="map"></div>',
    '  <div id="aviso">Mapa indisponivel sem internet.<br />Reconecte para carregar o mapa.</div>',
    '  <script>',
    '  (function () {',
    '    function enviar(dados) {',
    '      if (window.ReactNativeWebView) {',
    '        window.ReactNativeWebView.postMessage(JSON.stringify(dados));',
    '      }',
    '    }',
    '',
    '    // O Leaflet vem de CDN. Sem rede ele nao carrega e o mapa nao existe;',
    '    // avisamos o lado React em vez de ficar uma tela branca sem explicacao.',
    '    if (typeof L === "undefined") {',
    '      document.getElementById("map").style.display = "none";',
    '      document.getElementById("aviso").style.display = "flex";',
    '      enviar({ tipo: "sem-leaflet" });',
    '      return;',
    '    }',
    '',
    '    var map = L.map("map", { attributionControl: true })',
    '      .setView([' + latitude + ', ' + longitude + '], ' + zoom + ');',
    '    L.tileLayer("' + TILES_OSM + '", { attribution: "' + ATRIBUICAO_OSM + '", maxZoom: 19 }).addTo(map);',
    '',
    '    var marcadores = {};',
    '    var destacadoId = null;',
    '    var marcadorUnico = null;',
    '    var marcadorPosicao = null;',
    '    var linhaRota = null;',
    '',
    '    function icone(emoji, destacado) {',
    '      return L.divIcon({',
    '        className: "",',
    '        html: "<div class=\\"pin-area" + (destacado ? " pin-destacado" : "") +',
    '              "\\"><div class=\\"pin-evento\\">" + emoji + "</div></div>",',
    '        iconSize: [40, 40],',
    '        iconAnchor: [20, 20],',
    '      });',
    '    }',
    '',
    '    window.SaquaMapa = {',
    '      // lista: [{ id, latitude, longitude, emoji }]',
    '      definirMarcadores: function (lista) {',
    '        Object.keys(marcadores).forEach(function (id) {',
    '          map.removeLayer(marcadores[id].marcador);',
    '        });',
    '        marcadores = {};',
    '',
    '        lista.forEach(function (item) {',
    '          var marcador = L.marker([item.latitude, item.longitude], {',
    '            icon: icone(item.emoji, item.id === destacadoId),',
    '          }).addTo(map);',
    '',
    '          marcador.on("click", function () {',
    '            enviar({ tipo: "marcador", id: item.id });',
    '          });',
    '',
    '          marcadores[item.id] = { marcador: marcador, emoji: item.emoji };',
    '        });',
    '      },',
    '',
    '      destacar: function (id) {',
    '        destacadoId = id;',
    '        Object.keys(marcadores).forEach(function (chave) {',
    '          var item = marcadores[chave];',
    '          item.marcador.setIcon(icone(item.emoji, chave === id));',
    '        });',
    '      },',
    '',
    '      // Marcador unico das telas de cadastro e de detalhe do evento.',
    '      definirMarcadorUnico: function (latitude, longitude, emoji, titulo) {',
    '        if (!marcadorUnico) {',
    '          marcadorUnico = L.marker([latitude, longitude], {',
    '            icon: icone(emoji || "\\uD83D\\uDCCD", false),',
    '            title: titulo || "",',
    '            alt: titulo || "",',
    '          }).addTo(map);',
    '          return;',
    '        }',
    '        marcadorUnico.setLatLng([latitude, longitude]);',
    '      },',
    '',
    '      definirMinhaPosicao: function (latitude, longitude) {',
    '        if (latitude === null || longitude === null) {',
    '          if (marcadorPosicao) {',
    '            map.removeLayer(marcadorPosicao);',
    '            marcadorPosicao = null;',
    '          }',
    '          return;',
    '        }',
    '        if (!marcadorPosicao) {',
    '          marcadorPosicao = L.marker([latitude, longitude], {',
    '            icon: icone("\\uD83D\\uDFE2", false),',
    '            zIndexOffset: 500,',
    '          }).addTo(map);',
    '          return;',
    '        }',
    '        marcadorPosicao.setLatLng([latitude, longitude]);',
    '      },',
    '',
    '      // coordenadas: [[lat, lng], ...] ou null para apagar',
    '      definirRota: function (coordenadas) {',
    '        if (linhaRota) {',
    '          map.removeLayer(linhaRota);',
    '          linhaRota = null;',
    '        }',
    '        if (!coordenadas || !coordenadas.length) return;',
    '        linhaRota = L.polyline(coordenadas, { color: "#007bff", weight: 4 }).addTo(map);',
    '      },',
    '',
    '      centralizar: function (latitude, longitude, zoomAlvo) {',
    '        map.flyTo([latitude, longitude], zoomAlvo || map.getZoom(), { duration: 0.6 });',
    '      },',
    '',
    '      // pontos: [[lat, lng], ...]',
    '      ajustarPara: function (pontos) {',
    '        if (!pontos || !pontos.length) return;',
    '        map.fitBounds(L.latLngBounds(pontos), { padding: [40, 40] });',
    '      },',
    '    };',
    '',
    '    map.on("click", function (evento) {',
    '      enviar({ tipo: "clique", latitude: evento.latlng.lat, longitude: evento.latlng.lng });',
    '    });',
    '',
    '    map.on("moveend", function () {',
    '      var limites = map.getBounds();',
    '      enviar({',
    '        tipo: "movimento",',
    '        latitudeDelta: Math.abs(limites.getNorth() - limites.getSouth()),',
    '        longitudeDelta: Math.abs(limites.getEast() - limites.getWest()),',
    '      });',
    '    });',
    '',
    '    enviar({ tipo: "pronto" });',
    '  })();',
    '  </script>',
    '</body>',
    '</html>',
  ].join('\n');
}
