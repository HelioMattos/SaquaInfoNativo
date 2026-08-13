import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapaModal from '../../components/MapaModal';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';
import { useAdmin } from '../../hooks/useAdmin';
import { getModalStyles } from '../../styles/modal.styles';
import { Evento, parseImagens } from '../../types/evento';
import { compartilharEventoWhatsApp } from '../../utils/compartilhar';
import { confirmarAcao, mostrarAlerta } from '../../utils/mensagens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 40;
const IMAGE_HEIGHT = Platform.OS === 'web' ? 360 : 220;
const IMAGE_FIT = Platform.OS === 'web' ? 'contain' : 'cover';

export default function ModalScreen() {
  const { isDark } = useTheme();
  const styles = getModalStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAdmin } = useAdmin();
  const [activeImage, setActiveImage] = useState(0);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [carregando, setCarregando] = useState(true);

  const eventoId = (params.id as string) || '';

  useEffect(() => {
    if (!eventoId) {
      setCarregando(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'eventos', eventoId),
      (snap) => {
        if (snap.exists()) {
          setEvento({ id: snap.id, ...snap.data() } as Evento);
        }
        setCarregando(false);
      },
      () => setCarregando(false)
    );

    return unsubscribe;
  }, [eventoId]);

  const imagens = parseImagens(evento?.imagens);

  const formatarDataHora = (dataString: string | undefined) => {
    if (!dataString) return 'Não informada';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return 'Data inválida';
      return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Não informada';
    }
  };

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / IMAGE_WIDTH);
    setActiveImage(index);
  };

  const latitude = evento?.latitude ?? -22.9251;
  const longitude = evento?.longitude ?? -42.4862;

  const handleExcluir = () => {
    if (!evento) return;

    confirmarAcao('Excluir', 'Deseja remover este evento?', 'Excluir', async () => {
      try {
        await deleteDoc(doc(db, 'eventos', evento.id));
        router.back();
      } catch {
        mostrarAlerta('Erro', 'Não foi possível excluir o evento. Tente novamente.');
      }
    });
  };

  const handleShareWhatsApp = () => {
    if (!evento) return;
    compartilharEventoWhatsApp(
      {
        id: evento.id,
        titulo: evento.titulo,
        local: evento.local,
        dataInicio: evento.dataInicio,
      },
      formatarDataHora
    );
  };

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ color: styles.colors.texto, textAlign: 'center' }}>Evento não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={styles.colors.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Evento</Text>
        <View style={styles.actionButtons}>
          {isAdmin && (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push({ pathname: '/cadastrar', params: { id: evento.id } })}
              >
                <Ionicons name="create-outline" size={24} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleExcluir}>
                <Ionicons name="trash-outline" size={24} color="#dc3545" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
        {imagens.length > 0 && (
          <View style={styles.carouselContainer}>
            <FlatList
              data={imagens}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => String(index)}
              onScroll={onCarouselScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={[
                    styles.carouselImage,
                    {
                      width: IMAGE_WIDTH,
                      height: IMAGE_HEIGHT,
                      backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0',
                    },
                  ]}
                  contentFit={IMAGE_FIT}
                />
              )}
            />
            {imagens.length > 1 && (
              <View style={styles.carouselDots}>
                {imagens.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.carouselDot, index === activeImage && styles.carouselDotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.rowInfo}>
          <Text style={styles.tituloText}>{evento.titulo}</Text>
          <View style={styles.tag}>
            <Text style={styles.tagTexto}>{evento.categoria || 'Geral'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={24} color="#007bff" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Localização</Text>
            <Text style={styles.infoValue}>{evento.local}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={24} color="#28a745" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Início</Text>
            <Text style={styles.infoValue}>{formatarDataHora(evento.dataInicio)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={24} color="#dc3545" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Término</Text>
            <Text style={styles.infoValue}>{formatarDataHora(evento.dataTermino)}</Text>
          </View>
        </View>

        <View style={styles.descricaoContainer}>
          <Text style={styles.labelVerde}>Sobre o evento</Text>
          <Text style={styles.descricaoText}>
            {evento.descricao || 'Nenhuma descrição detalhada fornecida.'}
          </Text>
        </View>

        <TouchableOpacity style={styles.botaoWhatsApp} onPress={handleShareWhatsApp}>
          <Ionicons name="logo-whatsapp" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.textoWhatsApp}>Compartilhar com Amigos</Text>
        </TouchableOpacity>

        <MapaModal
          latitude={latitude}
          longitude={longitude}
          titulo={evento.titulo}
          categoria={evento.categoria}
          isDark={isDark}
          styles={styles}
        />
      </ScrollView>
    </View>
  );
}
