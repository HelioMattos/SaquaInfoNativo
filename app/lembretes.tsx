import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SeletorDataHora from '../components/SeletorDataHora';
import { useTheme } from '../context/ThemeContext';
import { agendarLembrete, cancelarLembrete, horarioSugerido, listarLembretes } from '../lib/lembretes';
import type { Lembrete, StatusLembrete } from '../types/lembrete';
import { confirmarAcao, mostrarAlerta } from '../utils/mensagens';

function textoParam(valor: string | string[] | undefined) {
  if (Array.isArray(valor)) return valor[0] ?? '';
  return valor ?? '';
}

function formatarQuando(ms: number) {
  const data = new Date(ms);
  const dia = data.toLocaleDateString('pt-BR');
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} às ${hora}`;
}

const corStatus: Record<StatusLembrete, string> = {
  Agendado: '#007bff',
  Publicado: '#28a745',
  Cancelado: '#888',
};

export default function LembretesScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{ eventoId?: string; titulo?: string; dataInicio?: string }>();
  const eventoId = textoParam(params.eventoId);
  const tituloInicial = textoParam(params.titulo);

  const [titulo, setTitulo] = useState(tituloInicial);
  const [mensagem, setMensagem] = useState(
    tituloInicial ? 'O evento está chegando. Confira no SaquaInfo.' : ''
  );
  const [quando, setQuando] = useState(() => horarioSugerido(textoParam(params.dataInicio)));
  const [itens, setItens] = useState<Lembrete[]>([]);
  const [ocupado, setOcupado] = useState(false);

  const fundo = isDark ? '#121212' : '#F2F2F7';
  const card = isDark ? '#1e1e1e' : '#fff';
  const texto = isDark ? '#fff' : '#333';
  const subtexto = isDark ? '#aaa' : '#666';
  const borda = isDark ? '#333' : '#ddd';
  const campo = isDark ? '#1e1e1e' : '#f9f9f9';

  const atualizarLista = useCallback(async () => {
    setItens(await listarLembretes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void atualizarLista();
    }, [atualizarLista])
  );

  const agendar = async () => {
    if (ocupado) return;
    setOcupado(true);
    try {
      const resultado = await agendarLembrete({
        titulo,
        mensagem,
        quando,
        eventoId: eventoId || undefined,
      });
      if (!resultado.ok) {
        mostrarAlerta('Lembrete', resultado.mensagem);
        return;
      }
      setTitulo('');
      setMensagem('');
      setQuando(horarioSugerido());
      await atualizarLista();
      mostrarAlerta(
        'Lembrete agendado',
        'O aviso fica neste aparelho. O Android pode atrasar o disparo para economizar bateria.'
      );
    } catch {
      mostrarAlerta('Lembrete', 'Não foi possível agendar. Nenhum lembrete novo foi salvo.');
    } finally {
      setOcupado(false);
    }
  };

  const cancelar = (item: Lembrete) => {
    confirmarAcao(
      'Cancelar lembrete',
      'O alarme será removido e o histórico fica como Cancelado.',
      'Cancelar lembrete',
      async () => {
        const resultado = await cancelarLembrete(item.id);
        if (!resultado.ok) {
          mostrarAlerta('Lembrete', resultado.mensagem);
          return;
        }
        await atualizarLista();
      }
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: card, borderRadius: 15, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007bff', marginBottom: 12 }}>
            Novo lembrete
          </Text>

          <Text style={{ color: texto, fontWeight: 'bold', marginBottom: 6 }}>Título</Text>
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Nome do evento"
            placeholderTextColor={subtexto}
            style={{
              borderWidth: 1,
              borderColor: borda,
              backgroundColor: campo,
              color: texto,
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
            }}
          />

          <Text style={{ color: texto, fontWeight: 'bold', marginBottom: 6 }}>Mensagem</Text>
          <TextInput
            value={mensagem}
            onChangeText={setMensagem}
            placeholder="Aviso curto para a tela bloqueada"
            placeholderTextColor={subtexto}
            multiline
            style={{
              borderWidth: 1,
              borderColor: borda,
              backgroundColor: campo,
              color: texto,
              borderRadius: 10,
              padding: 12,
              minHeight: 80,
              textAlignVertical: 'top',
              marginBottom: 12,
            }}
          />

          <Text style={{ color: texto, fontWeight: 'bold', marginBottom: 6 }}>Data e hora</Text>
          <SeletorDataHora
            value={quando}
            onChange={setQuando}
            isDark={isDark}
            dateTimeRow={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}
            dateTimeBtn={{
              backgroundColor: isDark ? '#2a2a2a' : '#f0f7ff',
              padding: 12,
              borderRadius: 10,
              width: '48%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            dateTimeText={{ color: '#007bff', fontWeight: 'bold', marginLeft: 6 }}
          />

          <TouchableOpacity
            onPress={() => void agendar()}
            disabled={ocupado}
            style={{
              backgroundColor: ocupado ? '#8ab6ff' : '#007bff',
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {ocupado ? 'Agendando...' : 'Agendar'}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: subtexto, marginTop: 10, lineHeight: 20 }}>
            O horário é aproximado. O Android pode entregar o aviso depois da hora escolhida.
          </Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007bff', marginBottom: 12 }}>
          Lembretes salvos
        </Text>
        {itens.length === 0 ? (
          <Text style={{ color: subtexto }}>Nenhum lembrete salvo neste aparelho.</Text>
        ) : (
          itens.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: card,
                borderRadius: 15,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: texto, fontWeight: 'bold', fontSize: 16 }}>{item.titulo}</Text>
              <Text style={{ color: subtexto, marginTop: 4 }}>{item.mensagem}</Text>
              <Text style={{ color: texto, marginTop: 8 }}>{formatarQuando(item.quando)}</Text>
              <Text style={{ color: corStatus[item.status], fontWeight: 'bold', marginTop: 6 }}>
                {item.status}
              </Text>
              {item.status === 'Agendado' && (
                <TouchableOpacity
                  onPress={() => cancelar(item)}
                  style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#dc3545" />
                  <Text style={{ color: '#dc3545', fontWeight: 'bold', marginLeft: 6 }}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
