import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StatusSync } from '../types/evento';

const ESTILOS: Record<StatusSync, { fundo: string; texto: string; icone: keyof typeof Ionicons.glyphMap; label: string }> = {
  PENDENTE: { fundo: '#fdecea', texto: '#c0392b', icone: 'cloud-offline-outline', label: 'PENDENTE' },
  SINCRONIZANDO: { fundo: '#eaf2f8', texto: '#1a5276', icone: 'sync-outline', label: 'SINCRONIZANDO' },
  SINCRONIZADO: { fundo: '#e8f8f5', texto: '#1e8449', icone: 'cloud-done-outline', label: 'SINCRONIZADO' },
};

export default function BadgeSync({ status }: { status?: StatusSync }) {
  const atual = ESTILOS[status ?? 'SINCRONIZADO'];

  return (
    <View style={[styles.badge, { backgroundColor: atual.fundo }]}>
      <Ionicons name={atual.icone} size={12} color={atual.texto} />
      <Text style={[styles.texto, { color: atual.texto }]}>{atual.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  texto: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
