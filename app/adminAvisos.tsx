import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  criarAviso,
  listarAvisos,
} from '../lib/db/avisosAdmin';

import type { AvisoAdmin } from '../types/avisoAdmin';

export default function AdminAvisosScreen() {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [avisos, setAvisos] = useState<AvisoAdmin[]>([]);

  useEffect(() => {
    carregarAvisos();
  }, []);

  async function carregarAvisos() {
    try {
      const dados = await listarAvisos();
      setAvisos(dados);
    } catch (error) {
      console.error(error);
    }
  }

  async function publicarAviso() {
    if (!titulo.trim() || !mensagem.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha o título e a mensagem.'
      );
      return;
    }

    try {
      await criarAviso({
        titulo,
        mensagem,
      });

      setTitulo('');
      setMensagem('');

      await carregarAvisos();

      Alert.alert(
        'Sucesso',
        'Aviso publicado com sucesso.'
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Erro',
        'Não foi possível publicar o aviso.'
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Painel Administrativo
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={[styles.input, styles.caixaMensagem]}
        placeholder="Mensagem"
        multiline
        value={mensagem}
        onChangeText={setMensagem}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={publicarAviso}
      >
        <Text style={styles.botaoTexto}>
          Publicar Aviso
        </Text>
      </TouchableOpacity>

      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>
              {item.titulo}
            </Text>

            <Text>{item.mensagem}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  caixaMensagem: {
    height: 100,
    textAlignVertical: 'top',
  },

  botao: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  botaoTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },

  cardTitulo: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});