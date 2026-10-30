import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { escolherImagem, mostrarOpcoesImagem, type OrigemFoto } from '../utils/imagens';

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
  const [previa, setPrevia] = useState<{ index: number; uri: string; origem: OrigemFoto } | null>(null);

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

  const abrirPrevia = (index: number) => {
    mostrarOpcoesImagem((uri, origem) => setPrevia({ index, uri, origem }));
  };

  const confirmarPrevia = () => {
    if (!previa) return;
    atualizarFoto(previa.index, previa.uri);
    setPrevia(null);
  };

  const descartarPrevia = () => setPrevia(null);

  const refazerPrevia = async () => {
    if (!previa) return;
    const { index, origem } = previa;
    setPrevia(null);
    const uri = await escolherImagem(origem);
    if (uri) setPrevia({ index, uri, origem });
  };

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
                    onPress={() => abrirPrevia(index)}
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
                onPress={() => abrirPrevia(index)}
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

      <Modal visible={!!previa} animationType="slide" transparent onRequestClose={descartarPrevia}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <View style={{ backgroundColor: fundo, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
            <Text style={{ color: texto, fontWeight: 'bold', fontSize: 18, marginBottom: 6 }}>
              Confirmar foto
            </Text>
            <Text style={{ color: subtexto, marginBottom: 12 }}>
              A foto só entra no evento depois de confirmar. Refazer descarta esta imagem e volta para a captura.
            </Text>
            {previa && (
              <Image
                source={{ uri: previa.uri }}
                style={{ width: '100%', height: 220, borderRadius: 12, backgroundColor: isDark ? '#000' : '#eee' }}
                contentFit="cover"
              />
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <TouchableOpacity style={flexBtn('#28a745')} onPress={confirmarPrevia}>
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={btnText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={flexBtn('#007bff')} onPress={() => void refazerPrevia()}>
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={btnText}>Refazer</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={descartarPrevia} style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#dc3545', fontWeight: 'bold' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
