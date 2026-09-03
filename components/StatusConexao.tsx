import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSync } from '../context/SyncContext';
import type { FaseConexao } from '../types/sync';

const ESTADOS: Record<
  FaseConexao,
  { fundo: string; titulo: string; icone: keyof typeof Ionicons.glyphMap }
> = {
  offline: { fundo: '#c0392b', titulo: 'Offline', icone: 'cloud-offline' },
  conectado: { fundo: '#1e8449', titulo: 'Conectado', icone: 'wifi' },
  sincronizando: { fundo: '#1a5276', titulo: 'Sincronizando', icone: 'sync' },
  concluido: { fundo: '#148f77', titulo: 'Concluído', icone: 'checkmark-circle' },
};

export default function StatusConexao() {
  const { fase, mensagem, pendentes } = useSync();
  const insets = useSafeAreaInsets();
  const visual = ESTADOS[fase];
  const mostrarContador = pendentes > 0 && fase !== 'concluido';

  return (
    <View style={[styles.container, { backgroundColor: visual.fundo, paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.linha}>
        {fase === 'sincronizando' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name={visual.icone} size={16} color="#fff" />
        )}
        <Text style={styles.titulo}>{visual.titulo}</Text>
        {mostrarContador ? (
          <View style={styles.contador}>
            <Text style={styles.contadorTexto}>{pendentes}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.mensagem}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  contador: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mensagem: {
    marginTop: 4,
    color: '#fff',
    fontSize: 12,
    lineHeight: 17,
  },
});
