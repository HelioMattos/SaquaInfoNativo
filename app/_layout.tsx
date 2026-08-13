import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { auth } from '../firebaseConfig';

export default function RootLayout() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      if (isInitializing) setIsInitializing(false);
    });
    return unsubscribe;
  }, [isInitializing]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
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
      </ThemeProvider>
    </AuthProvider>
  );
}
