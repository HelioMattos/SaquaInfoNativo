import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavegacao } from '../hooks/useNavegacao';
import { Coordenada } from '../utils/rota';
import MarcadorMapa from './MarcadorMapa';
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
  const mapRef = useRef<MapView>(null);
  const destino: Coordenada = { latitude, longitude };

  const onCentralizarMapa = useCallback((posicao: Coordenada) => {
    mapRef.current?.animateToRegion(
      {
        latitude: posicao.latitude,
        longitude: posicao.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      600
    );
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

  const handleTracarRota = async () => {
    const resultado = await tracarRota();
    if (!resultado) return;

    const { origem, infoRota } = resultado;
    const pontos = [origem, destino, ...infoRota.coordenadas];
    mapRef.current?.fitToCoordinates(pontos, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  };

  const handleLimparRota = () => {
    limparRota();
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View>
      <View style={[styles.mapWrapper, (rota || navegando) && styles.mapWrapperRota]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          userInterfaceStyle={isDark ? 'dark' : 'light'}
          showsUserLocation
          showsMyLocationButton
          followsUserLocation={navegando}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={destino} title={titulo}>
            <MarcadorMapa categoria={categoria} />
          </Marker>

          {minhaPosicao && (
            <Marker coordinate={minhaPosicao} title="Você está aqui">
              <MarcadorMapa cor="#28a745" />
            </Marker>
          )}

          {rota && (
            <Polyline coordinates={rota.coordenadas} strokeColor="#007bff" strokeWidth={4} />
          )}
        </MapView>
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
