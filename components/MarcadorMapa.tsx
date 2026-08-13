import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getIconeCategoria } from '../utils/mapa';

interface MarcadorMapaProps {
  categoria?: string;
  cor?: string;
}

export default function MarcadorMapa({ categoria, cor = '#007bff' }: MarcadorMapaProps) {
  return (
    <View style={[styles.container, { backgroundColor: cor }]}>
      <Ionicons name={getIconeCategoria(categoria) as any} size={18} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
