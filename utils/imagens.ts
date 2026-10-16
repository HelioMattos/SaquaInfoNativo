import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export type OrigemFoto = 'camera' | 'galeria';

function avisarPermissaoNegada(tipo: OrigemFoto) {
  const mensagem =
    tipo === 'camera'
      ? 'Ative a câmera para tirar fotos dos eventos. Nenhuma foto nova foi adicionada.'
      : 'Ative o acesso às fotos para escolher imagens dos eventos. Nenhuma foto nova foi adicionada.';

  Alert.alert('Permissão necessária', mensagem, [
    { text: 'Agora não', style: 'cancel' },
    { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
  ]);
}

export async function solicitarPermissao(tipo: OrigemFoto): Promise<boolean> {
  const pedido =
    tipo === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (pedido.status !== 'granted') {
    avisarPermissaoNegada(tipo);
    return false;
  }
  return true;
}

export async function escolherImagem(tipo: OrigemFoto): Promise<string | null> {
  const permitido = await solicitarPermissao(tipo);
  if (!permitido) return null;

  const opcoes: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  };

  const resultado =
    tipo === 'camera'
      ? await ImagePicker.launchCameraAsync(opcoes)
      : await ImagePicker.launchImageLibraryAsync(opcoes);

  if (resultado.canceled || !resultado.assets[0]) return null;
  return resultado.assets[0].uri;
}

function ehUrlRemota(uri: string) {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function jaEhDataUrl(uri: string) {
  return uri.startsWith('data:image/');
}

/** Reduz a foto e converte para gravar no SQLite do aparelho. */
export async function prepararImagemParaSalvar(uri: string): Promise<string> {
  if (!uri) return '';
  if (ehUrlRemota(uri) || jaEhDataUrl(uri)) return uri;

  const resultado = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 720 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!resultado.base64) {
    throw new Error('Não foi possível processar a imagem.');
  }

  return `data:image/jpeg;base64,${resultado.base64}`;
}

export async function prepararListaImagens(fotos: string[]): Promise<string[]> {
  const preparadas = await Promise.all(fotos.map((foto) => prepararImagemParaSalvar(foto)));
  const lista = preparadas.filter((url) => url !== '');

  const tamanhoTotal = lista.reduce((acc, url) => acc + url.length, 0);
  if (tamanhoTotal > 900_000) {
    throw new Error(
      'As fotos ficaram grandes demais. Remova uma foto ou use imagens menores.'
    );
  }

  return lista;
}

export function mostrarOpcoesImagem(aoCapturar: (uri: string, origem: OrigemFoto) => void) {
  const capturar = async (origem: OrigemFoto) => {
    const uri = await escolherImagem(origem);
    if (uri) aoCapturar(uri, origem);
  };

  if (Platform.OS === 'web') {
    void capturar('galeria');
    return;
  }

  Alert.alert('Adicionar foto', 'Como deseja enviar a imagem?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Câmera', onPress: () => void capturar('camera') },
    { text: 'Galeria', onPress: () => void capturar('galeria') },
  ]);
}
