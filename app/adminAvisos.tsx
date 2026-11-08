import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AdminAvisosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Painel Administrativo
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>
          Avisos Administrativos
        </Text>

        <Text>
          Aqui o administrador poderá criar e visualizar avisos.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>
          Relatório Rápido
        </Text>

        <Text>Total de mensagens: 0</Text>
        <Text>Total de feedbacks: 0</Text>
        <Text>Total de avisos: 0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});