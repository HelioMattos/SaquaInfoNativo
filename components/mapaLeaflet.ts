export const BASE_MAPA = 'https://saquainfo.local';

export function documentoLeaflet(script: string, extraCss = '') {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #e9eef2; }
    .leaflet-container { font-family: sans-serif; }
    ${extraCss}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function avisar(dados) {
      var msg = JSON.stringify(dados);
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
    }
    ${script}
  </script>
</body>
</html>`;
}
