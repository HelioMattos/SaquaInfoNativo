import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { listarMensagens } from '../../lib/db/mensagens';
import type { Mensagem } from '../../types/mensagem';

export default function MensagensScreen() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  useEffect(() => {
    carregarMensagens();
  }, []);

  async function carregarMensagens() {
    try {
      const dados = await listarMensagens();
      setMensagens(dados);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Central de Mensagens
      </Text>

      <FlatList
        data={mensagens}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.semMensagens}>
            Nenhuma mensagem encontrada.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>
              De: {item.remetenteEmail}
            </Text>

            <Text style={styles.texto}>
              {item.conteudo}
            </Text>

            <Text style={styles.data}>
              {new Date(item.criadaEm).toLocaleString('pt-BR')}
            </Text>

            {!item.lida && (
              <Text style={styles.naoLida}>
                Não lida
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  cardTitulo: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },

  texto: {
    fontSize: 14,
    marginBottom: 8,
  },

  data: {
    fontSize: 12,
    color: '#666',
  },

  naoLida: {
    color: '#d9534f',
    marginTop: 5,
    fontWeight: 'bold',
  },

  semMensagens: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
  },
});