import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SeletorDataHora from '../components/SeletorDataHora';
import { useTheme } from '../context/ThemeContext';
import {
  abrirConfiguracoesNotificacoes,
  agendarLembrete,
  cancelarLembrete,
  ErroLembrete,
  EstadoPermissaoNotificacoes,
  listarLembretesAtualizados,
  marcarLembreteDisparado,
  mensagemPermissao,
  pedirPermissaoNotificacoes,
  testarNotificacaoAgora,
  verificarPermissaoNotificacoes,
} from '../lib/notificacoes';
import { getCadastrarStyles } from '../styles/cadastrar.styles';
import { Lembrete, ROTULO_STATUS_LEMBRETE, StatusLembrete } from '../types/lembrete';
import { confirmarAcao, mostrarAlerta } from '../utils/mensagens';

const CORES_STATUS: Record<StatusLembrete, string> = {
  AGENDADO: '#007bff',
  DISPARADO: '#28a745',
  CANCELADO: '#6c757d',
};

const UMA_HORA_MS = 60 * 60 * 1000;

function semSegundos(data: Date): Date {
  const copia = new Date(data);
  copia.setSeconds(0, 0);
  return copia;
}

/** Sugere 1 hora antes do início do evento; se já passou, 5 minutos a partir de agora. */
function horarioSugerido(inicioEvento?: string): Date {
  const inicio = inicioEvento ? new Date(inicioEvento).getTime() : NaN;
  const umaHoraAntes = inicio - UMA_HORA_MS;
  if (!isNaN(umaHoraAntes) && umaHoraAntes > Date.now() + 60 * 1000) {
    return semSegundos(new Date(umaHoraAntes));
  }
  return semSegundos(new Date(Date.now() + 5 * 60 * 1000));
}

function formatarQuando(ms: number): string {
  const data = new Date(ms);
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function LembretesScreen() {
  const { isDark } = useTheme();
  const styles = getCadastrarStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams<{ eventoId?: string; titulo?: string; inicio?: string }>();

  const eventoId = params.eventoId || undefined;
  const tituloEvento = params.titulo || '';

  const [titulo, setTitulo] = useState(tituloEvento ? `Lembrete: ${tituloEvento}` : '');
  const [mensagem, setMensagem] = useState(
    tituloEvento ? 'Seu evento em Saquarema começa em breve. Toque para ver os detalhes.' : ''
  );
  const [quando, setQuando] = useState(() => horarioSugerido(params.inicio));
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [permissao, setPermissao] = useState<EstadoPermissaoNotificacoes | null>(null);
  const [salvando, setSalvando] = useState(false);

  const atualizar = useCallback(async () => {
    try {
      const [lista, estado] = await Promise.all([
        listarLembretesAtualizados(),
        verificarPermissaoNotificacoes(),
      ]);
      setLembretes(lista);
      setPermissao(estado);
    } catch {
      mostrarAlerta('Erro', 'Não foi possível carregar os lembretes.');
    }
  }, []);

  // Recarrega ao voltar das configurações do aparelho ou de outra tela.
  useFocusEffect(
    useCallback(() => {
      atualizar();
    }, [atualizar])
  );

  useEffect(() => {
    const assinatura = Notifications.addNotificationReceivedListener(async (notificacao) => {
      const lembreteId = notificacao.request.content.data?.lembreteId;
      if (typeof lembreteId === 'string') await marcarLembreteDisparado(lembreteId);
      atualizar();
    });
    return () => assinatura.remove();
  }, [atualizar]);

  const handlePermitir = async () => {
    const estado = await pedirPermissaoNotificacoes();
    setPermissao(estado);
    if (estado !== 'concedida') mostrarAlerta('Notificações', mensagemPermissao(estado));
  };

  const handleTestar = async () => {
    try {
      await testarNotificacaoAgora();
    } catch (erro) {
      mostrarAlerta('Notificações', erro instanceof Error ? erro.message : 'Falha ao enviar o teste.');
    }
  };

  const handleAgendar = async () => {
    setSalvando(true);
    try {
      const lembrete = await agendarLembrete({ titulo, mensagem, quando, eventoId });
      mostrarAlerta(
        'Lembrete agendado',
        `Previsto para ${formatarQuando(lembrete.quando)}. O Android pode entregar a notificação com alguns minutos de atraso para economizar bateria.`
      );
      await atualizar();
    } catch (erro) {
      if (erro instanceof ErroLembrete) {
        mostrarAlerta('Verifique o lembrete', erro.message);
      } else {
        mostrarAlerta('Erro', 'Não foi possível agendar o lembrete. Tente novamente.');
      }
      setPermissao(await verificarPermissaoNotificacoes());
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = (lembrete: Lembrete) => {
    confirmarAcao('Cancelar lembrete', `Cancelar "${lembrete.titulo}"?`, 'Cancelar lembrete', async () => {
      try {
        await cancelarLembrete(lembrete);
        await atualizar();
      } catch {
        mostrarAlerta('Erro', 'Não foi possível cancelar o lembrete.');
      }
    });
  };

  const cardFundo = isDark ? '#1e1e1e' : '#f8f9fa';
  const cardBorda = isDark ? '#333' : '#eee';
  const subtexto = isDark ? '#aaa' : '#666';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {permissao && permissao !== 'concedida' && (
        <View
          style={{
            backgroundColor: isDark ? '#3a2e00' : '#fff3cd',
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: isDark ? '#ffe08a' : '#856404' }}>{mensagemPermissao(permissao)}</Text>
          <TouchableOpacity
            onPress={permissao === 'pendente' ? handlePermitir : abrirConfiguracoesNotificacoes}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: '#007bff', fontWeight: 'bold' }}>
              {permissao === 'pendente' ? 'Permitir notificações' : 'Abrir configurações'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ex.: Show na Praia de Itaúna"
        placeholderTextColor={styles.colors.placeholder}
        maxLength={80}
      />

      <Text style={styles.label}>Mensagem</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={mensagem}
        onChangeText={setMensagem}
        placeholder="Texto exibido na notificação (evite dados pessoais)"
        placeholderTextColor={styles.colors.placeholder}
        multiline
        maxLength={200}
      />

      <Text style={styles.label}>Data e hora do lembrete</Text>
      <View style={styles.dateTimeGroup}>
        <SeletorDataHora
          value={quando}
          onChange={(data) => setQuando(semSegundos(data))}
          isDark={isDark}
          dateTimeRow={styles.dateTimeRow}
          dateTimeBtn={styles.dateTimeBtn}
          dateTimeText={styles.dateTimeText}
        />
      </View>

      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={[styles.button, salvando && { opacity: 0.7 }]}
          onPress={handleAgendar}
          disabled={salvando}
        >
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Agendar lembrete</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007bff' }]}
          onPress={handleTestar}
        >
          <Text style={[styles.buttonText, { color: '#007bff' }]}>Testar notificação agora</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30 }}>
        <Text style={[styles.label, { marginTop: 0, fontSize: 18 }]}>Meus lembretes</Text>
        <TouchableOpacity onPress={atualizar} accessibilityLabel="Atualizar lista">
          <Ionicons name="refresh" size={22} color="#007bff" />
        </TouchableOpacity>
      </View>

      {lembretes.length === 0 && (
        <Text style={{ color: subtexto, marginTop: 10 }}>Nenhum lembrete cadastrado.</Text>
      )}

      {lembretes.map((lembrete) => (
        <TouchableOpacity
          key={lembrete.id}
          disabled={!lembrete.eventoId}
          onPress={() => router.push({ pathname: '/modal', params: { id: lembrete.eventoId } })}
          style={{
            backgroundColor: cardFundo,
            borderColor: cardBorda,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginTop: 10,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: styles.colors.texto, fontWeight: 'bold', flex: 1 }} numberOfLines={1}>
              {lembrete.titulo}
            </Text>
            <Text style={{ color: CORES_STATUS[lembrete.status], fontWeight: 'bold', marginLeft: 8 }}>
              {ROTULO_STATUS_LEMBRETE[lembrete.status]}
            </Text>
          </View>
          <Text style={{ color: subtexto, marginTop: 4 }}>{formatarQuando(lembrete.quando)}</Text>
          <Text style={{ color: styles.colors.texto, marginTop: 4 }} numberOfLines={2}>
            {lembrete.mensagem}
          </Text>
          {lembrete.status === 'AGENDADO' && (
            <TouchableOpacity onPress={() => handleCancelar(lembrete)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#dc3545', fontWeight: 'bold' }}>Cancelar lembrete</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
