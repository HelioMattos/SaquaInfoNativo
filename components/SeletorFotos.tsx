import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { mostrarOpcoesImagem } from '../utils/imagens';

interface SeletorFotosProps {
  fotos: string[];
  onChange: (fotos: string[]) => void;
  isDark: boolean;
  obrigatoria?: boolean;
}

export default function SeletorFotos({ fotos, onChange, isDark, obrigatoria }: SeletorFotosProps) {
  const borda = isDark ? '#333' : '#ddd';
  const fundo = isDark ? '#1e1e1e' : '#f9f9f9';
  const texto = isDark ? '#fff' : '#333';
  const subtexto = isDark ? '#aaa' : '#666';

  const atualizarFoto = (index: number, uri: string) => {
    const novas = [...fotos];
    while (novas.length < 3) novas.push('');
    novas[index] = uri;
    onChange(novas);
  };

  const removerFoto = (index: number) => {
    const novas = [...fotos];
    novas[index] = '';
    onChange(novas);
  };

  const labels = ['Foto 1 (obrigatória)', 'Foto 2', 'Foto 3'];

  return (
    <View>
      {[0, 1, 2].map((index) => {
        const uri = fotos[index] || '';
        const isObrigatoria = obrigatoria && index === 0;

        return (
          <View
            key={index}
            style={{
              marginBottom: 12,
              borderWidth: 1,
              borderColor: borda,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: fundo,
            }}
          >
            {uri ? (
              <View>
                <Image
                  source={{ uri }}
                  style={{
                    width: '100%',
                    height: Platform.OS === 'web' ? 240 : 160,
                    backgroundColor: fundo,
                  }}
                  contentFit={Platform.OS === 'web' ? 'contain' : 'cover'}
                />
                <View style={{ flexDirection: 'row', padding: 10, gap: 8 }}>
                  <TouchableOpacity
                    style={flexBtn('#007bff')}
                    onPress={() => mostrarOpcoesImagem((nova) => atualizarFoto(index, nova))}
                  >
                    <Ionicons name="refresh" size={16} color="#fff" />
                    <Text style={btnText}>Trocar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={flexBtn('#dc3545')} onPress={() => removerFoto(index)}>
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={btnText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={{ padding: 20, alignItems: 'center' }}
                onPress={() => mostrarOpcoesImagem((nova) => atualizarFoto(index, nova))}
              >
                <Ionicons name="image-outline" size={36} color="#007bff" />
                <Text style={{ color: texto, fontWeight: 'bold', marginTop: 8 }}>
                  {labels[index]}
                </Text>
                <Text style={{ color: subtexto, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  Toque para abrir a câmera ou escolher da galeria
                </Text>
              </TouchableOpacity>
            )}

            {isObrigatoria && !uri && (
              <Text style={{ color: '#dc3545', fontSize: 11, paddingHorizontal: 12, paddingBottom: 8 }}>
                * Obrigatória
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const flexBtn = (bg: string) => ({
  flex: 1,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: bg,
  padding: 10,
  borderRadius: 8,
  gap: 6,
});

const btnText = { color: '#fff', fontWeight: 'bold' as const, fontSize: 13 };
