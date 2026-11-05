import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapaLeaflet, { MapaLeafletRef } from './MapaLeaflet';
import { MensagemMapa, montarHtmlMapa } from '../utils/mapaLeaflet';

interface MapaCustomizadoProps {
  coordenadas: { latitude: number; longitude: number };
  setCoordenadas: (coords: { latitude: number; longitude: number }) => void;
  isDark?: boolean;
}

export default function MapaCustomizado({
  coordenadas,
  setCoordenadas,
  isDark,
}: MapaCustomizadoProps) {
  const mapaRef = useRef<MapaLeafletRef>(null);
  const setCoordenadasRef = useRef(setCoordenadas);
  setCoordenadasRef.current = setCoordenadas;

  // O centro inicial e fixado na montagem: trocar o HTML recarregaria o
  // WebView a cada toque. O marcador acompanha por injecao de JS.
  const centroInicial = useRef(coordenadas).current;

  const html = useMemo(
    () =>
      montarHtmlMapa({
        latitude: centroInicial.latitude,
        longitude: centroInicial.longitude,
        zoom: 15,
        isDark,
        cursorCruz: true,
      }),
    [centroInicial, isDark]
  );

  useEffect(() => {
    mapaRef.current?.executar(
      `window.SaquaMapa.definirMarcadorUnico(${coordenadas.latitude}, ${coordenadas.longitude})`
    );
  }, [coordenadas.latitude, coordenadas.longitude]);

  const aoReceberMensagem = useCallback((mensagem: MensagemMapa) => {
    if (mensagem.tipo !== 'clique') return;
    setCoordenadasRef.current({
      latitude: mensagem.latitude,
      longitude: mensagem.longitude,
    });
  }, []);

  return (
    <MapaLeaflet
      ref={mapaRef}
      html={html}
      onMensagem={aoReceberMensagem}
      style={styles.map}
      rolagemAninhada
    />
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%', borderRadius: 10 },
});
