import * as FileSystem from 'expo-file-system/legacy';
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
  const uri = resultado.assets[0].uri;
  try {
    return await copiarParaCache(uri);
  } catch {
    return uri;
  }
}

async function copiarParaCache(uri: string): Promise<string> {
  if (!uri || uri.startsWith('file://') || uri.startsWith('data:image/')) return uri;
  const destino = `${FileSystem.cacheDirectory}saqua-foto-${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: destino });
  return destino;
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

  let local = uri;
  try {
    local = await copiarParaCache(uri);
  } catch {
    local = uri;
  }

  let largura = 480;
  let compressao = 0.4;
  let menor = '';
  let ultimoErro = 'Não foi possível processar a imagem.';

  for (let tentativa = 0; tentativa < 3; tentativa += 1) {
    try {
      const resultado = await ImageManipulator.manipulateAsync(
        local,
        [{ resize: { width: largura } }],
        { compress: compressao, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const base64 =
        resultado.base64 ||
        (resultado.uri
          ? await FileSystem.readAsStringAsync(resultado.uri, { encoding: FileSystem.EncodingType.Base64 })
          : '');
      if (base64) {
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        if (!menor || dataUrl.length < menor.length) menor = dataUrl;
        if (dataUrl.length <= 350_000) return dataUrl;
      }
    } catch (erro) {
      ultimoErro = erro instanceof Error ? erro.message : ultimoErro;
    }
    largura = Math.max(240, Math.round(largura * 0.7));
    compressao = 0.3;
  }

  if (menor && menor.length <= 500_000) return menor;
  throw new Error(ultimoErro);
}

export async function prepararListaImagens(fotos: string[]): Promise<string[]> {
  const preparadas = await Promise.all(fotos.map((foto) => prepararImagemParaSalvar(foto)));
  const lista = preparadas.filter((url) => url !== '');

  const tamanhoTotal = lista.reduce((acc, url) => acc + url.length, 0);
  if (tamanhoTotal > 1_200_000) {
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
