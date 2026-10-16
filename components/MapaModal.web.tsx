import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useNavegacao } from '../hooks/useNavegacao';
import { configurarIconesLeaflet, criarIconeEventoLeaflet } from '../utils/mapa';
import { Coordenada } from '../utils/rota';
import MapaRotaControls from './MapaRotaControls';

interface MapaModalProps {
  latitude: number;
  longitude: number;
  titulo: string;
  categoria?: string;
  isDark: boolean;
  styles: {
    mapWrapper: object;
    mapWrapperRota?: object;
    map: object;
  };
}

export default function MapaModal({
  latitude,
  longitude,
  titulo,
  categoria,
  isDark,
  styles,
}: MapaModalProps) {
  const containerRef = useRef<View>(null);
  const mapInstance = useRef<import('leaflet').Map | null>(null);
  const marcadorUsuario = useRef<import('leaflet').Marker | null>(null);
  const rotaLayer = useRef<import('leaflet').Polyline | null>(null);

  const destino: Coordenada = { latitude, longitude };
  const [mapaPronto, setMapaPronto] = useState(false);

  const onCentralizarMapa = useCallback((posicao: Coordenada) => {
    const mapa = mapInstance.current;
    if (!mapa) return;
    mapa.setView([posicao.latitude, posicao.longitude], mapa.getZoom(), { animate: true });
  }, []);

  const {
    rota,
    minhaPosicao,
    carregando,
    navegando,
    passoAtual,
    proximoPasso,
    distanciaFormatada,
    tracarRota,
    iniciarNavegacao,
    pararNavegacao,
    limparRota,
  } = useNavegacao({ destino, onCentralizarMapa });

  useEffect(() => {
    let cancelado = false;

    const iniciarMapa = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      configurarIconesLeaflet(L);

      if (cancelado) return;

      const el = containerRef.current as unknown as HTMLElement | null;
      if (!el) return;

      mapInstance.current?.remove();

      const mapa = L.map(el, { scrollWheelZoom: !navegando }).setView([latitude, longitude], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapa);

      L.marker([latitude, longitude], { icon: criarIconeEventoLeaflet(L, categoria) })
        .addTo(mapa)
        .bindPopup(titulo);

      mapInstance.current = mapa;
      setMapaPronto(true);
    };

    iniciarMapa();

    return () => {
      cancelado = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [latitude, longitude, titulo, categoria]);

  useEffect(() => {
    const atualizarMarcadorUsuario = async () => {
      if (!minhaPosicao || !mapInstance.current) return;

      const L = (await import('leaflet')).default;
      const pos = [minhaPosicao.latitude, minhaPosicao.longitude] as [number, number];

      if (marcadorUsuario.current) {
        marcadorUsuario.current.setLatLng(pos);
      } else {
        marcadorUsuario.current = L.marker(pos).addTo(mapInstance.current).bindPopup('Você está aqui');
      }
    };

    atualizarMarcadorUsuario();
  }, [minhaPosicao]);

  const desenharRotaNoMapa = async (infoRota: NonNullable<typeof rota>) => {
    const L = (await import('leaflet')).default;
    const mapa = mapInstance.current;
    if (!mapa) return;

    rotaLayer.current?.remove();

    const polyline = L.polyline(
      infoRota.coordenadas.map((c) => [c.latitude, c.longitude] as [number, number]),
      { color: '#007bff', weight: 4 }
    ).addTo(mapa);

    rotaLayer.current = polyline;
    mapa.fitBounds(polyline.getBounds(), { padding: [30, 30] });
  };

  const handleTracarRota = async () => {
    if (!mapaPronto) return;

    const resultado = await tracarRota();
    if (resultado?.infoRota) {
      await desenharRotaNoMapa(resultado.infoRota);
    }
  };

  const handleLimparRota = async () => {
    limparRota();
    rotaLayer.current?.remove();
    rotaLayer.current = null;
    marcadorUsuario.current?.remove();
    marcadorUsuario.current = null;

    const L = (await import('leaflet')).default;
    const mapa = mapInstance.current;
    if (!mapa) return;

    L.marker([latitude, longitude], { icon: criarIconeEventoLeaflet(L, categoria) })
      .addTo(mapa)
      .bindPopup(titulo);
    mapa.setView([latitude, longitude], 14);
  };

  return (
    <View>
      <View style={[styles.mapWrapper, (rota || navegando) && styles.mapWrapperRota]}>
        <View ref={containerRef} style={styles.map} />
      </View>

      <MapaRotaControls
        carregando={carregando}
        rota={rota}
        isDark={isDark}
        navegando={navegando}
        passoAtual={passoAtual}
        proximoPasso={proximoPasso}
        distanciaFormatada={distanciaFormatada}
        onTracarRota={handleTracarRota}
        onIniciarNavegacao={iniciarNavegacao}
        onPararNavegacao={pararNavegacao}
        onLimparRota={rota ? handleLimparRota : undefined}
      />
    </View>
  );
}
