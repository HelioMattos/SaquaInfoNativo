import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import StatusConexao from '../components/StatusConexao';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SyncProvider } from '../context/SyncContext';
import { ThemeProvider } from '../context/ThemeContext';
import { configurarNotificacoes, marcarLembreteDisparado } from '../lib/notificacoes';

configurarNotificacoes();

/** Ao tocar na notificação de um lembrete, abre o evento associado (ou a lista de lembretes). */
function useAberturaPorNotificacao(pronto: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!pronto) return;

    const abrir = (resposta: Notifications.NotificationResponse) => {
      const { lembreteId, eventoId } = resposta.notification.request.content.data ?? {};
      if (typeof lembreteId !== 'string') return;

      marcarLembreteDisparado(lembreteId).catch(() => undefined);
      if (typeof eventoId === 'string') {
        router.push({ pathname: '/modal', params: { id: eventoId } });
      } else {
        router.push('/lembretes');
      }
      Notifications.clearLastNotificationResponse();
    };

    // App aberto a partir da notificação estando fechado.
    try {
      const ultima = Notifications.getLastNotificationResponse();
      if (ultima) abrir(ultima);
    } catch {
      // indisponível na versão web
    }

    const assinatura = Notifications.addNotificationResponseReceivedListener(abrir);
    return () => assinatura.remove();
  }, [pronto, router]);
}

function RootNavigator() {
  const { loading } = useAuth();
  useAberturaPorNotificacao(!loading);

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <StatusConexao />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusConexao />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="registrar" />
        <Stack.Screen
          name="cadastrar"
          options={{
            headerShown: true,
            title: 'Gerenciar Evento',
          }}
        />
        <Stack.Screen name="lembretes" options={{ headerShown: true, title: 'Lembretes' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SyncProvider>
          <RootNavigator />
        </SyncProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
