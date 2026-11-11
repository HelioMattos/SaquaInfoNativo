import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import StatusConexao from '../components/StatusConexao';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SyncProvider } from '../context/SyncContext';
import { ThemeProvider } from '../context/ThemeContext';
import { garantirCanalLembretes } from '../lib/notificacoes';
import { observarPublicacaoLembretes } from '../lib/lembretes';

function RootNavigator() {
  const { loading } = useAuth();

  useEffect(() => {
    const quadro = requestAnimationFrame(() => {
      void SplashScreen.hideAsync();
    });
    void garantirCanalLembretes();
    const inscricao = observarPublicacaoLembretes();
    return () => {
      cancelAnimationFrame(quadro);
      inscricao.remove();
    };
  }, []);

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
            title: 'Evento 1.0.7',
          }}
        />
        <Stack.Screen
          name="lembretes"
          options={{
            headerShown: true,
            title: 'Lembretes de eventos',
          }}
        />
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
