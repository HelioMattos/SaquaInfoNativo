import React from 'react';
import { StyleSheet, View } from 'react-native';
import IconeCategoria from './IconeCategoria';

interface MarcadorMapaProps {
  categoria?: string;
  cor?: string;
  destacado?: boolean;
}

export default function MarcadorMapa({
  categoria,
  cor = '#007bff',
  destacado = false,
}: MarcadorMapaProps) {
  const tamanho = destacado ? 30 : 20;

  return (
    <View style={styles.area}>
      <View style={[styles.camada, { transform: [{ scale: destacado ? 1.15 : 1 }] }]}>
        <View style={styles.halo}>
          <IconeCategoria categoria={categoria} size={tamanho + 4} color="#fff" />
        </View>
        <View style={styles.frente}>
          <IconeCategoria categoria={categoria} size={tamanho} color={cor} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camada: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frente: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
