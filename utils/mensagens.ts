import { Alert, Platform } from 'react-native';

export function mostrarAlerta(titulo: string, mensagem: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

export function confirmarAcao(
  titulo: string,
  mensagem: string,
  textoConfirmar: string,
  onConfirm: () => void | Promise<void>
) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) {
      Promise.resolve(onConfirm());
    }
    return;
  }

  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: textoConfirmar,
      style: 'destructive',
      onPress: () => Promise.resolve(onConfirm()),
    },
  ]);
}
