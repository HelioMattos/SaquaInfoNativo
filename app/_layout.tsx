import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import StatusConexao from '../components/StatusConexao';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SyncProvider } from '../context/SyncContext';
import { ThemeProvider } from '../context/ThemeContext';

function RootNavigator() {
  const { loading } = useAuth();

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
