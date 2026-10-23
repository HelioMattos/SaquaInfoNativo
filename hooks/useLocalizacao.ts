import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import { Coordenada } from '../utils/rota';

export type ResultadoLocalizacao =
  | { status: 'ok'; coordenada: Coordenada }
  | { status: 'negada' | 'gps-desligado' | 'indisponivel' };

const TIMEOUT_POSICAO_MS = 8000;

function alertarPermissaoBloqueada(mensagem: string) {
  Alert.alert('Permissão bloqueada', `${mensagem} Libere a localização nas configurações do aparelho.`, [
    { text: 'Agora não', style: 'cancel' },
    { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
  ]);
}

export async function garantirPermissaoLocalizacao(mensagem: string): Promise<boolean> {
  const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') return true;

  // Sem "canAskAgain" o Android não mostra mais a janela de permissão.
  if (!canAskAgain && Platform.OS !== 'web') {
    alertarPermissaoBloqueada(mensagem);
  } else {
    Alert.alert('Permissão necessária', mensagem);
  }
  return false;
}

async function garantirGpsLigado(): Promise<boolean> {
  if (Platform.OS === 'web' || (await Location.hasServicesEnabledAsync())) return true;

  try {
    // Abre a janela do Android que pede para ligar a localização.
    await Location.enableNetworkProviderAsync();
    return await Location.hasServicesEnabledAsync();
  } catch {
    Alert.alert('GPS desligado', 'Ligue a localização do aparelho para traçar a rota até o evento.');
    return false;
  }
}

export async function obterLocalizacaoAtual(): Promise<ResultadoLocalizacao> {
  const permitido = await garantirPermissaoLocalizacao(
    'Permita o acesso à localização para traçar a rota até o evento.'
  );
  if (!permitido) return { status: 'negada' };

  if (!(await garantirGpsLigado())) return { status: 'gps-desligado' };

  try {
    const ultima = await Location.getLastKnownPositionAsync();
    if (ultima) {
      return {
        status: 'ok',
        coordenada: {
          latitude: ultima.coords.latitude,
          longitude: ultima.coords.longitude,
        },
      };
    }

    const posicao = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_POSICAO_MS);
      }),
    ]);

    return {
      status: 'ok',
      coordenada: {
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      },
    };
  } catch {
    return { status: 'indisponivel' };
  }
}
