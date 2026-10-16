import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

interface MapaCustomizadoProps {
  coordenadas: { latitude: number; longitude: number };
  setCoordenadas: (coords: { latitude: number; longitude: number }) => void;
  isDark?: boolean;
}

export default function MapaCustomizado({ coordenadas, setCoordenadas, isDark }: MapaCustomizadoProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const setCoordenadasRef = useRef(setCoordenadas);
  setCoordenadasRef.current = setCoordenadas;

  const latInicial = coordenadas.latitude;
  const lngInicial = coordenadas.longitude;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'map_click' && setCoordenadasRef.current) {
          setCoordenadasRef.current({ latitude: data.lat, longitude: data.lng });
        }
      } catch {
        // ignora outras mensagens
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      JSON.stringify({
        type: 'set_marker',
        lat: coordenadas.latitude,
        lng: coordenadas.longitude,
      }),
      '*'
    );
  }, [coordenadas.latitude, coordenadas.longitude]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; height: 100%; width: 100%; overflow: hidden; }
        .leaflet-container { cursor: crosshair !important; }
        ${isDark ? '.leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }' : ''}
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${latInicial}, ${lngInicial}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var marker = L.marker([${latInicial}, ${lngInicial}]).addTo(map);

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          marker.setLatLng([lat, lng]);
          window.parent.postMessage(JSON.stringify({ type: 'map_click', lat: lat, lng: lng }), '*');
        });

        window.addEventListener('message', function(event) {
          try {
            var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (data.type === 'set_marker') {
              marker.setLatLng([data.lat, data.lng]);
            }
          } catch (e) {}
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={mapHtml}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Mapa para cadastro"
      />
    </View>
  );
}
