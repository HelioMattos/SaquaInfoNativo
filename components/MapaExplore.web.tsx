import { useRouter } from 'expo-router';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebaseConfig';
import { Evento, eventoEstaAtivo } from '../types/evento';

function escapeHtml(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function MapaExplore() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'eventos'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista: Evento[] = [];
      querySnapshot.forEach((docSnap) => {
        const evento = { id: docSnap.id, ...docSnap.data() } as Evento;
        if (eventoEstaAtivo(evento)) lista.push(evento);
      });
      setEventos(lista);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_EVENT') {
        const eventoClicado = eventos.find((e) => e.id === event.data.id);
        if (eventoClicado) {
          router.push({
            pathname: '/modal',
            params: { id: eventoClicado.id },
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [eventos, router]);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.textoCarregando}>A carregar mapa interativo...</Text>
      </View>
    );
  }

  const marcadoresJs = eventos
    .filter((e) => e.latitude && e.longitude)
    .map(
      (e) => `
      L.marker([${e.latitude}, ${e.longitude}])
        .addTo(map)
        .bindPopup(\`
          <div style="font-family: sans-serif; text-align: center; padding: 5px;">
            <h4 style="margin: 0 0 5px 0; color: #333;">${escapeHtml(e.titulo)}</h4>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">${escapeHtml(e.local)}</p>
            <button
              onclick="window.parent.postMessage({ type: 'NAVIGATE_EVENT', id: '${e.id}' }, '*')"
              style="border: none; cursor: pointer; display: inline-block; background: #007bff; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; width: 100%;"
            >
              Ver Detalhes
            </button>
          </div>
        \`);
    `
    )
    .join('\n');

  const conteudoHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
        .leaflet-popup-content-wrapper { border-radius: 8px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([-22.9251, -42.4862], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        ${marcadoresJs}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <iframe
        srcDoc={conteudoHtml}
        style={{ border: 0, width: '100%', height: '100%', flex: 1 }}
        title="Mapa de Eventos"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  textoCarregando: { marginTop: 10, color: '#666' },
});
