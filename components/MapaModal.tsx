import React from 'react';
import { Linking, View } from 'react-native';
import { useNavegacao } from '../hooks/useNavegacao';
import { Coordenada } from '../utils/rota';
import MapaRotaControls from './MapaRotaControls';
import MapaTiles from './MapaTiles';

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

export default function MapaModal({ latitude, longitude, isDark, styles }: MapaModalProps) {
  const destino: Coordenada = { latitude, longitude };
  const {
    rota,
    carregando,
    navegando,
    passoAtual,
    proximoPasso,
    distanciaFormatada,
    tracarRota,
    iniciarNavegacao,
    pararNavegacao,
    limparRota,
  } = useNavegacao({ destino });

  const abrirNoMapa = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    void Linking.openURL(url);
  };

  return (
    <View>
      <View style={[styles.mapWrapper, (rota || navegando) && styles.mapWrapperRota]}>
        <MapaTiles latitude={latitude} longitude={longitude} altura={220} />
      </View>
      <MapaRotaControls
        carregando={carregando}
        rota={rota}
        isDark={isDark}
        navegando={navegando}
        passoAtual={passoAtual}
        proximoPasso={proximoPasso}
        distanciaFormatada={distanciaFormatada}
        onTracarRota={() => {
          void tracarRota();
          abrirNoMapa();
        }}
        onIniciarNavegacao={iniciarNavegacao}
        onPararNavegacao={pararNavegacao}
        onLimparRota={rota ? limparRota : undefined}
      />
    </View>
  );
}
