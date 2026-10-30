import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { abrirConfiguracoesNotificacao, testarNotificacaoAgora } from '../lib/notificacoes';
import { mostrarAlerta } from '../utils/mensagens';

export default function PainelNotificacoes() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const card = isDark ? '#1e1e1e' : '#fff';
  const texto = isDark ? '#fff' : '#333';
  const subtexto = isDark ? '#aaa' : '#666';
  const borda = isDark ? '#333' : '#F2F2F7';

  const testar = async () => {
    if (ocupado) return;
    setOcupado(true);
    try {
      const resultado = await testarNotificacaoAgora();
      if (resultado.ok) {
        mostrarAlerta(
          'Notificação enviada',
          'O teste imediato confirma a permissão e o canal. Ele não agenda um lembrete de evento.'
        );
        return;
      }
      mostrarAlerta('Notificações', resultado.mensagem);
    } catch {
      mostrarAlerta(
        'Notificações',
        'Não foi possível publicar o teste. Confira a permissão e o canal Lembretes de eventos.'
      );
    } finally {
      setOcupado(false);
    }
  };

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: card,
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#007bff' }}>
        Lembretes de eventos
      </Text>
      <Text style={{ fontSize: 14, color: subtexto, marginBottom: 12, lineHeight: 20 }}>
        Agende um aviso para um evento de Saquarema. O teste imediato só confirma permissão e canal.
      </Text>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: borda,
        }}
        onPress={() => router.push('/lembretes')}
      >
        <Ionicons name="alarm-outline" size={24} color="#007bff" />
        <Text style={{ marginLeft: 15, fontSize: 16, color: texto }}>Agendar lembrete de evento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: borda,
        }}
        onPress={() => void testar()}
        disabled={ocupado}
      >
        <Ionicons name="notifications-outline" size={24} color="#007bff" />
        <Text style={{ marginLeft: 15, fontSize: 16, color: texto }}>
          {ocupado ? 'Enviando teste...' : 'Testar notificação agora'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
        onPress={() => void abrirConfiguracoesNotificacao()}
      >
        <Ionicons name="settings-outline" size={24} color="#007bff" />
        <Text style={{ marginLeft: 15, fontSize: 16, color: texto }}>Configurações de notificações</Text>
      </TouchableOpacity>
    </View>
  );
}
