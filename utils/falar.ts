import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export function falar(texto: string) {
  if (!texto) return;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
    return;
  }

  Speech.stop();
  Speech.speak(texto, { language: 'pt-BR', rate: 0.95 });
}

export function pararFala() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return;
  }

  Speech.stop();
}
