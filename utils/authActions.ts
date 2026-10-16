import { Alert, Platform } from 'react-native';

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
