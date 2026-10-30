import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export async function solicitarPermissao(tipo: 'camera' | 'galeria'): Promise<boolean> {
  if (tipo === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Ative a câmera para tirar fotos dos eventos.');
      return false;
    }
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão necessária', 'Ative o acesso às fotos para escolher imagens dos eventos.');
    return false;
  }
  return true;
}

export async function escolherImagem(tipo: 'camera' | 'galeria'): Promise<string | null> {
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

/** Reduz a foto e converte para salvar direto no Firestore (sem Firebase Storage). */
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

export function mostrarOpcoesImagem(aoEscolher: (uri: string) => void) {
  if (Platform.OS === 'web') {
    escolherImagem('galeria').then((uri) => {
      if (uri) aoEscolher(uri);
    });
    return;
  }

  Alert.alert('Adicionar foto', 'Como deseja enviar a imagem?', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Câmera',
      onPress: async () => {
        const uri = await escolherImagem('camera');
        if (uri) aoEscolher(uri);
      },
    },
    {
      text: 'Galeria',
      onPress: async () => {
        const uri = await escolherImagem('galeria');
        if (uri) aoEscolher(uri);
      },
    },
  ]);
}
