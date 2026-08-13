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

  const posicao = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: posicao.coords.latitude,
    longitude: posicao.coords.longitude,
  };
}
