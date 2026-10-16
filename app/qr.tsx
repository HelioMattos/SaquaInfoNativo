import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getQrCodeImageUrl, getSiteUrl } from '../utils/site';

export default function QrScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const siteUrl = useMemo(() => getSiteUrl(), []);
  const qrImage = useMemo(() => getQrCodeImageUrl(siteUrl), [siteUrl]);

  const fundo = isDark ? '#121212' : '#f8f9fa';
  const card = isDark ? '#1e1e1e' : '#fff';
  const texto = isDark ? '#fff' : '#333';
  const subtexto = isDark ? '#aaa' : '#666';
  const borda = isDark ? '#333' : '#eee';

  const copiarLink = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(siteUrl);
      window.alert('Link copiado!');
      return;
    }

    await Share.share({
      message: `Acesse o SaquaInfo: ${siteUrl}`,
      url: siteUrl,
    });
  };

  const abrirLink = () => {
    Linking.openURL(siteUrl);
  };

  return (
    <View style={{ flex: 1, backgroundColor: fundo }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'ios' ? 56 : 40,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: borda,
          backgroundColor: card,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={26} color={texto} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: texto }}>QR Code do app</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <Text style={{ color: subtexto, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
          Mostre este QR Code para outras pessoas escanearem e abrirem o SaquaInfo no celular.
        </Text>

        <View
          style={{
            backgroundColor: card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: borda,
            alignItems: 'center',
            width: '100%',
            maxWidth: 360,
          }}
        >
          <Image
            source={{ uri: qrImage }}
            style={{ width: 260, height: 260, borderRadius: 12 }}
            contentFit="contain"
          />

          <TouchableOpacity onPress={abrirLink} style={{ marginTop: 16 }}>
            <Text style={{ color: '#007bff', fontWeight: '600', textAlign: 'center' }}>{siteUrl}</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 24,
            backgroundColor: isDark ? '#1a3a5c' : '#f0f7ff',
            borderRadius: 14,
            padding: 16,
            width: '100%',
            maxWidth: 360,
          }}
        >
          <Text style={{ color: texto, lineHeight: 22, fontSize: 14 }}>
            <Text style={{ fontWeight: 'bold', color: '#007bff' }}>Android: </Text>
            use a câmera ou leitor de QR, abra o link e toque em Instalar app ou Adicionar à tela
            inicial.
            {'\n\n'}
            <Text style={{ fontWeight: 'bold', color: '#007bff' }}>iPhone: </Text>
            use a Câmera, abra no Safari e toque em Compartilhar → Adicionar à Tela de Início.
          </Text>
        </View>

        <TouchableOpacity
          onPress={copiarLink}
          style={{
            marginTop: 24,
            backgroundColor: '#007bff',
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="share-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Compartilhar link</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
