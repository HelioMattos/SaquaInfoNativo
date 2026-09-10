import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { obterResumoAvaliacao } from '../lib/db/avaliacoes';
import { LEGENDAS_NOTA, type ResumoAvaliacao } from '../types/avaliacao';

const LEGENDA_CURTA = ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Muito bom'];

export default function AvaliacaoEvento({ eventoId, tituloEvento, isDark }: {
  eventoId: string;
  tituloEvento: string;
  isDark: boolean;
}) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { isConnected, salvarAvaliacao } = useSync();
  const [resumo, setResumo] = useState<ResumoAvaliacao | null>(null);
  const [nota, setNota] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const texto = isDark ? '#fff' : '#333';
  const subtexto = isDark ? '#aaa' : '#666';
  const fundo = isDark ? '#1e1e1e' : '#f8f9fa';
  const borda = isDark ? '#333' : '#eee';

  const carregarResumo = async () => {
    const dados = await obterResumoAvaliacao(eventoId, user?.email);
    setResumo(dados);
  };

  const limparFormulario = () => {
    setNota(0);
    setMensagem('');
  };

  useEffect(() => {
    carregarResumo();
  }, [eventoId, user?.email]);

  const handleSalvar = async () => {
    if (!isLoggedIn || !user?.email) {
      Alert.alert('Entrar', 'Faça login para avaliar o evento.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (nota < 1) {
      Alert.alert('Atenção', 'Escolha de 1 a 5 estrelas. 1 é ruim e 5 é muito bom.');
      return;
    }

    setSalvando(true);
    try {
      await salvarAvaliacao({
        eventoId,
        email: user.email,
        nota,
        mensagem,
        tituloEvento,
      });
      await carregarResumo();
      limparFormulario();
      Alert.alert(
        isConnected ? 'Avaliação salva' : 'Salvo offline',
        isConnected
          ? 'Obrigado pela sua opinião.'
          : 'Sua avaliação ficou neste aparelho e será sincronizada quando a conexão retornar.'
      );
    } catch (erro) {
      const textoErro = erro instanceof Error ? erro.message : 'Não foi possível salvar a avaliação.';
      Alert.alert('Erro', textoErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={[styles.caixa, { backgroundColor: fundo, borderColor: borda }]}>
      <Text style={[styles.titulo, { color: texto }]}>Avaliação do evento</Text>
      <Text style={[styles.ajuda, { color: subtexto }]}>1 estrela = ruim · 5 estrelas = muito bom</Text>

      {resumo && resumo.total > 0 ? (
        <Text style={[styles.media, { color: texto }]}>
          Média {resumo.media.toFixed(1)} ({resumo.total} {resumo.total === 1 ? 'avaliação' : 'avaliações'})
        </Text>
      ) : (
        <Text style={[styles.media, { color: subtexto }]}>Ainda não há avaliações.</Text>
      )}

      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map((valor) => (
          <TouchableOpacity key={valor} onPress={() => setNota(valor)} accessibilityLabel={`${valor} estrelas`}>
            <Ionicons
              name={valor <= nota ? 'star' : 'star-outline'}
              size={32}
              color="#f5a623"
              style={{ marginRight: 6 }}
            />
          </TouchableOpacity>
        ))}
      </View>
      {nota > 0 ? <Text style={[styles.legenda, { color: texto }]}>{LEGENDA_CURTA[nota]}</Text> : null}

      <TextInput
        style={[styles.campo, { color: texto, borderColor: borda, backgroundColor: isDark ? '#121212' : '#fff' }]}
        placeholder={isLoggedIn ? 'Deixe uma mensagem sobre o evento (opcional)' : 'Faça login para deixar uma mensagem'}
        placeholderTextColor={isDark ? '#777' : '#aaa'}
        value={mensagem}
        onChangeText={setMensagem}
        multiline
        editable={isLoggedIn}
        maxLength={280}
      />

      <TouchableOpacity style={styles.botao} onPress={handleSalvar} disabled={salvando}>
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>{isLoggedIn ? 'Enviar avaliação' : 'Entrar para avaliar'}</Text>
        )}
      </TouchableOpacity>

      {resumo?.comentarios.map((item) => (
        <View key={`${item.email}-${item.atualizadoEm}`} style={[styles.comentario, { borderColor: borda }]}>
          <Text style={[styles.comentarioMeta, { color: subtexto }]}>
            {'★'.repeat(item.nota)}{'☆'.repeat(5 - item.nota)} · {item.email} · {LEGENDAS_NOTA[item.nota]}
          </Text>
          <Text style={[styles.comentarioTexto, { color: texto }]}>{item.mensagem}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    marginTop: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  titulo: { fontSize: 16, fontWeight: 'bold' },
  ajuda: { fontSize: 12, marginTop: 4, marginBottom: 8 },
  media: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  estrelas: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legenda: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  campo: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  botao: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  comentario: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  comentarioMeta: { fontSize: 12, marginBottom: 4 },
  comentarioTexto: { fontSize: 14, lineHeight: 20 },
});
