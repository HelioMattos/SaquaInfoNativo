import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import BadgeSync from '../../components/BadgeSync';
import HeaderActions from '../../components/HeaderActions';
import IconeCategoria from '../../components/IconeCategoria';
import LogoSaquaInfo from '../../components/LogoSaquaInfo';
import { useSync } from '../../context/SyncContext';
import { useTheme } from '../../context/ThemeContext';
import { listarEventos } from '../../lib/db/eventos';
import { listarMediasAvaliacoes } from '../../lib/db/avaliacoes';
import { getIndexStyles } from '../../styles/index.styles';
import { Evento, eventoEstaAtivo, parseImagens } from '../../types/evento';

function formatarInicio(dataString: string) {
  const data = new Date(dataString);
  if (isNaN(data.getTime())) return 'Data não informada';
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function HomeScreen() {
  const { isDark } = useTheme();
  const styles = getIndexStyles(isDark);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [medias, setMedias] = useState<Record<string, { media: number; total: number }>>({});
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const { fila } = useSync();

  const carregarEventos = useCallback(async () => {
    setCarregando(true);
    try {
      const [lista, notas] = await Promise.all([listarEventos(), listarMediasAvaliacoes()]);
      setEventos(lista.filter(eventoEstaAtivo));
      setMedias(notas);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarEventos();
    }, [carregarEventos])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <LogoSaquaInfo />
        <HeaderActions showThemeToggle />
      </View>

      {carregando ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: styles.colors.subtexto, marginTop: 40 }}>
              Nenhum evento ativo no momento.
            </Text>
          }
          renderItem={({ item }) => {
            const imagens = parseImagens(item.imagens);
            const fotoCapa =
              imagens[0] || 'https://via.placeholder.com/150x150.png?text=Sem+Foto';

            const statusFila = fila.find((itemFila) => itemFila.id === item.id)?.status;
            const avaliacao = medias[item.id];

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/modal',
                    params: { id: item.id },
                  })
                }
              >
                <Image
                  source={{ uri: fotoCapa }}
                  style={styles.cardImagem}
                  contentFit={Platform.OS === 'web' ? 'contain' : 'cover'}
                />

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitulo} numberOfLines={2}>
                    {item.titulo}
                  </Text>
                  <View style={styles.cardMetaRow}>
                    <Text style={styles.cardData}>{formatarInicio(item.dataInicio)}</Text>
                    <View style={styles.cardCategoria}>
                      <IconeCategoria categoria={item.categoria} size={11} color="#007bff" />
                      <Text style={styles.cardCategoriaTexto}>{item.categoria || 'Outros'}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardLocal} numberOfLines={1}>
                    📍 {item.local}
                  </Text>
                  {avaliacao ? (
                    <Text style={{ color: '#f5a623', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                      {'★'.repeat(Math.round(avaliacao.media))}
                      {'☆'.repeat(5 - Math.round(avaliacao.media))} {avaliacao.media.toFixed(1)} ({avaliacao.total})
                    </Text>
                  ) : null}
                  <BadgeSync status={statusFila ?? item.statusSync} />
                </View>

                <Ionicons name="chevron-forward" size={20} color="#007bff" style={styles.cardSeta} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
