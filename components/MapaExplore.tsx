import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { listarEventos } from '../lib/db/eventos';
import { Evento, eventoEstaAtivo } from '../types/evento';
import MapaTiles from './MapaTiles';

const CENTRO = { latitude: -22.9251, longitude: -42.4862 };

export default function MapaExplore() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [centro, setCentro] = useState(CENTRO);
  const fundo = isDark ? '#121212' : '#fff';

  const carregarEventos = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = (await listarEventos()).filter(eventoEstaAtivo);
      setEventos(lista);
      const primeiro = lista.find((evento) => evento.latitude && evento.longitude);
      if (primeiro) {
        setCentro({ latitude: primeiro.latitude, longitude: primeiro.longitude });
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregarEventos();
    }, [carregarEventos])
  );

  if (carregando) {
    return (
      <View style={[styles.centro, { backgroundColor: fundo }]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: fundo }]}>
      <MapaTiles
        latitude={centro.latitude}
        longitude={centro.longitude}
        altura={360}
        marcadores={eventos
          .filter((evento) => evento.latitude && evento.longitude)
          .map((evento) => ({
            id: evento.id,
            latitude: evento.latitude,
            longitude: evento.longitude,
            titulo: evento.titulo,
          }))}
        onSelecionar={(id) => router.push({ pathname: '/modal', params: { id } })}
      />
      {eventos.length === 0 ? (
        <Text style={styles.vazio}>Nenhum evento ativo para mostrar no mapa.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vazio: { textAlign: 'center', color: '#666', marginTop: 16 },
});
