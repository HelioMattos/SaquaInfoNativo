import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { listarEventos } from '../lib/db/eventos';
import { Evento, eventoEstaAtivo } from '../types/evento';
import { getEmojiCategoria } from '../utils/mapa';

function escapeHtml(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatarInicio(dataString: string) {
  const data = new Date(dataString);
  if (isNaN(data.getTime())) return 'Data não informada';
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function resumir(texto: string, limite = 90) {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;
  return `${limpo.slice(0, limite).trim()}…`;
}

export default function MapaExplore() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarEventos = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarEventos();
      setEventos(lista.filter(eventoEstaAtivo));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarEventos();
    }, [carregarEventos])
  );

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
    .map((e) => {
      const dica = `
        <div class="dica-evento">
          <strong>${escapeHtml(e.titulo)}</strong>
          <span class="meta">${escapeHtml(e.categoria || 'Outros')} · ${escapeHtml(formatarInicio(e.dataInicio))}</span>
          <span>${escapeHtml(e.local)}</span>
          <span class="desc">${escapeHtml(resumir(e.descricao))}</span>
          <em>Clique para abrir o evento</em>
        </div>
      `.replace(/\s+/g, ' ');

      return `
      (function() {
        var marcador = L.marker([${e.latitude}, ${e.longitude}], {
          icon: L.divIcon({
            className: '',
            html: ${JSON.stringify(`<div class="pin-area"><div class="pin-evento">${getEmojiCategoria(e.categoria)}</div></div>`)},
            iconSize: [44, 44],
            iconAnchor: [22, 22]
          })
        }).addTo(map);
        marcador.bindTooltip(${JSON.stringify(dica)}, {
          direction: 'top',
          sticky: true,
          opacity: 1,
          className: 'balao-evento'
        });
        marcador.on('mouseover', function() {
          var el = this.getElement();
          if (el) el.classList.add('pin-hover');
        });
        marcador.on('mouseout', function() {
          var el = this.getElement();
          if (el) el.classList.remove('pin-hover');
        });
        marcador.on('click', function() {
          window.parent.postMessage({ type: 'NAVIGATE_EVENT', id: ${JSON.stringify(e.id)} }, '*');
        });
      })();
    `;
    })
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
        .balao-evento { background: transparent; border: none; box-shadow: none; }
        .balao-evento .leaflet-tooltip-content { margin: 0; }
        .dica-evento {
          min-width: 180px;
          max-width: 240px;
          background: #fff;
          border-radius: 10px;
          padding: 10px 12px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.18);
          font-family: sans-serif;
          color: #333;
        }
        .dica-evento strong { display: block; font-size: 14px; margin-bottom: 4px; }
        .dica-evento span { display: block; font-size: 12px; color: #555; margin-top: 3px; }
        .dica-evento .meta { color: #28a745; font-weight: bold; }
        .dica-evento .desc { color: #666; }
        .dica-evento em { display: block; margin-top: 6px; font-size: 12px; font-style: normal; color: #007bff; font-weight: bold; }
        .pin-area {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }
        .pin-evento {
          font-size: 22px;
          line-height: 1;
          filter: drop-shadow(0 0 2px #fff) drop-shadow(0 1px 2px rgba(0,0,0,0.45));
          transform-origin: center center;
          transition: transform 0.15s ease;
        }
        .leaflet-marker-icon:hover .pin-evento,
        .pin-hover .pin-evento {
          transform: scale(1.55);
        }
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
