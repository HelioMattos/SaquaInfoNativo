import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { obterRelatorio } from '../lib/db/relatorios';

export default function RelatorioScreen() {
  const [dados, setDados] = useState({
    totalMensagens: 0,
    totalFeedbacks: 0,
    totalAvisos: 0,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const resultado = await obterRelatorio();
    setDados(resultado);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Relatório Administrativo
      </Text>

      <View style={styles.card}>
        <Text style={styles.item}>
          📩 Mensagens: {dados.totalMensagens}
        </Text>

        <Text style={styles.item}>
          ⭐ Feedbacks: {dados.totalFeedbacks}
        </Text>

        <Text style={styles.item}>
          📢 Avisos: {dados.totalAvisos}
        </Text>
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
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },

  item: {
    fontSize: 18,
    marginBottom: 10,
  },
});