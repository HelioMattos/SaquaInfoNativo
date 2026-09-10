import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { Coordenada } from '../utils/rota';

export async function obterLocalizacaoAtual(): Promise<Coordenada | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      'Permissão necessária',
      'Ative a localização do aparelho para traçar a rota até o evento.'
    );
    return null;
  }

  try {
    const ultima = await Location.getLastKnownPositionAsync();
    if (ultima) {
      return {
        latitude: ultima.coords.latitude,
        longitude: ultima.coords.longitude,
      };
    }

    const posicao = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 8000);
      }),
    ]);

    return {
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude,
    };
  } catch {
    return null;
  }
}
