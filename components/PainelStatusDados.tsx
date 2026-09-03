import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSync } from '../context/SyncContext';
import { useTheme } from '../context/ThemeContext';
import type { FaseConexao } from '../types/sync';
import BadgeSync from './BadgeSync';

const ROTULOS: Record<FaseConexao, string> = {
  offline: 'Offline',
  conectado: 'Conectado',
  sincronizando: 'Sincronizando',
  concluido: 'Concluído',
};

export default function PainelStatusDados() {
  const { isDark } = useTheme();
  const { fase, mensagem, pendentes, horaUltimaSincronizacao, fila } = useSync();
  const texto = isDark ? '#fff' : '#333';
  const subtexto = isDark ? '#aaa' : '#666';
  const card = isDark ? '#1e1e1e' : '#fff';
  const borda = isDark ? '#333' : '#eee';

  return (
    <View style={[styles.card, { backgroundColor: card }]}>
      <Text style={styles.titulo}>Status dos dados</Text>
      <Text style={[styles.estado, { color: texto }]}>Agora: {ROTULOS[fase]}</Text>
      <Text style={[styles.mensagem, { color: subtexto }]}>{mensagem}</Text>

      <View style={[styles.linha, { borderBottomColor: borda }]}>
        <Ionicons name="cloud-upload-outline" size={22} color="#007bff" />
        <Text style={[styles.linhaTexto, { color: subtexto }]}>
          Alterações pendentes: {pendentes}
        </Text>
      </View>
      <View style={[styles.linha, { borderBottomColor: borda, borderBottomWidth: fila.length ? 1 : 0 }]}>
        <Ionicons name="time-outline" size={22} color="#007bff" />
        <Text style={[styles.linhaTexto, { color: subtexto }]}>
          Última sincronização: {horaUltimaSincronizacao ?? 'ainda não houve'}
        </Text>
      </View>

      {fila.slice(0, 5).map((item) => (
        <View key={`${item.id}-${item.atualizadoEm}`} style={styles.itemFila}>
          <Text style={[styles.itemDescricao, { color: texto }]} numberOfLines={1}>
            {item.descricao}
          </Text>
          <BadgeSync status={item.status} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
  },
  estado: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mensagem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    width: '100%',
  },
  linhaTexto: {
    marginLeft: 12,
    fontSize: 15,
    flex: 1,
  },
  itemFila: {
    marginTop: 10,
  },
  itemDescricao: {
    fontSize: 14,
    fontWeight: '500',
  },
});
