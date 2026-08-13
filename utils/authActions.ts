import { signOut } from 'firebase/auth';
import { Alert, Platform } from 'react-native';
import { auth } from '../firebaseConfig';

export async function fazerLogout(): Promise<boolean> {
  try {
    await signOut(auth);
    return true;
  } catch {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('Não foi possível sair da conta. Tente novamente.');
    } else {
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    }
    return false;
  }
}

export function confirmarLogout(onConfirm: () => void | Promise<void>) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      Promise.resolve(onConfirm());
    }
    return;
  }

  Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Sair',
      style: 'destructive',
      onPress: () => Promise.resolve(onConfirm()),
    },
  ]);
}
