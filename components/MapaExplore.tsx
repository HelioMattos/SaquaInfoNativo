import { useRouter } from 'expo-router';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { db } from '../firebaseConfig';
import { Evento, eventoEstaAtivo } from '../types/evento';
import MarcadorMapa from './MarcadorMapa';

export default function MapaExplore() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'eventos'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista: Evento[] = [];
      querySnapshot.forEach((docSnap) => {
        const evento = { id: docSnap.id, ...docSnap.data() } as Evento;
        if (eventoEstaAtivo(evento)) lista.push(evento);
      });
      setEventos(lista);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  const abrirEvento = (evento: Evento) => {
    router.push({
      pathname: '/modal',
      params: { id: evento.id },
    });
  };

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.textoCarregando}>A carregar mapa de Saquarema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -22.9251,
          longitude: -42.4862,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {eventos.map((evento) => {
          if (!evento.latitude || !evento.longitude) return null;

          return (
            <Marker
              key={evento.id}
              coordinate={{ latitude: evento.latitude, longitude: evento.longitude }}
            >
              <MarcadorMapa categoria={evento.categoria} />
              <Callout onPress={() => abrirEvento(evento)}>
                <View style={styles.balao}>
                  <Text style={styles.tituloBalao}>{evento.titulo}</Text>
                  <Text style={styles.textoBalao}>Toque para ver detalhes</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  textoCarregando: { marginTop: 10, color: '#666' },
  balao: { padding: 5, maxWidth: 200, alignItems: 'center' },
  tituloBalao: { fontWeight: 'bold', fontSize: 14, marginBottom: 2, textAlign: 'center' },
  textoBalao: { fontSize: 12, color: '#007bff', textAlign: 'center' },
});
