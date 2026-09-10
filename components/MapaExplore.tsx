import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { listarEventos } from '../lib/db/eventos';
import { Evento, eventoEstaAtivo, parseImagens } from '../types/evento';
import MarcadorMapa from './MarcadorMapa';

const REGIAO_INICIAL: Region = {
  latitude: -22.9251,
  longitude: -42.4862,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function distanciaAjustada(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const dLat = a.latitude - b.latitude;
  const dLng = (a.longitude - b.longitude) * Math.cos((a.latitude * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function eventoMaisProximo(eventos: Evento[], latitude: number, longitude: number, raioMax: number) {
  let melhor: Evento | null = null;
  let menor = raioMax;

  for (const evento of eventos) {
    if (!evento.latitude || !evento.longitude) continue;
    const distancia = distanciaAjustada(
      { latitude, longitude },
      { latitude: evento.latitude, longitude: evento.longitude }
    );
    if (distancia < menor) {
      menor = distancia;
      melhor = evento;
    }
  }

  return melhor;
}

function formatarInicio(dataString: string) {
  const data = new Date(dataString);
  if (isNaN(data.getTime())) return 'Data não informada';
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function MapaExplore() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState<Evento | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [regiao, setRegiao] = useState<Region>(REGIAO_INICIAL);
  const [pontos, setPontos] = useState<Record<string, { x: number; y: number }>>({});
  const mapRef = useRef<MapView>(null);
  const ultimoToqueMarcador = useRef(0);

  const cores = {
    fundo: isDark ? '#121212' : '#fff',
    cartao: isDark ? '#1e1e1e' : '#fff',
    texto: isDark ? '#fff' : '#333',
    subtexto: isDark ? '#aaa' : '#666',
    borda: isDark ? '#333' : '#e5e5e5',
  };

  const carregarEventos = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarEventos();
      setEventos(lista.filter(eventoEstaAtivo));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarEventos();
    }, [carregarEventos])
  );

  const abrirEvento = (evento: Evento) => {
    router.push({
      pathname: '/modal',
      params: { id: evento.id },
    });
  };

  const aoTocarMarcador = (evento: Evento) => {
    if (selecionado?.id === evento.id) {
      abrirEvento(evento);
      return;
    }
    setSelecionado(evento);
  };

  const aoTocarMapa = (latitude: number, longitude: number) => {
    if (Date.now() - ultimoToqueMarcador.current < 400) return;

    const raio = Math.max(regiao.latitudeDelta, regiao.longitudeDelta) * 0.18;
    const evento = eventoMaisProximo(eventos, latitude, longitude, raio);
    if (!evento) {
      setSelecionado(null);
      return;
    }
    aoTocarMarcador(evento);
  };

  const atualizarPontos = useCallback(async () => {
    if (!mapRef.current) return;
    const proximo: Record<string, { x: number; y: number }> = {};

    await Promise.all(
      eventos.map(async (evento) => {
        if (!evento.latitude || !evento.longitude) return;
        try {
          const ponto = await mapRef.current!.pointForCoordinate({
            latitude: evento.latitude,
            longitude: evento.longitude,
          });
          proximo[evento.id] = ponto;
        } catch {
          // o mapa ainda não calculou o ponto
        }
      })
    );

    setPontos(proximo);
  }, [eventos]);

  useEffect(() => {
    void atualizarPontos();
  }, [atualizarPontos]);

  if (carregando) {
    return (
      <View style={[styles.centro, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.textoCarregando}>A carregar mapa de Saquarema...</Text>
      </View>
    );
  }

  const foto = parseImagens(selecionado?.imagens)[0];

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={REGIAO_INICIAL}
        onMapReady={() => {
          void atualizarPontos();
        }}
        onRegionChangeComplete={(proxima) => {
          setRegiao(proxima);
          void atualizarPontos();
        }}
        onPress={(evento) => {
          if (evento.nativeEvent.action === 'marker-press') return;
          const { latitude, longitude } = evento.nativeEvent.coordinate;
          aoTocarMapa(latitude, longitude);
        }}
      >
        {eventos.map((evento) => {
          if (!evento.latitude || !evento.longitude) return null;
          const destacado = hoverId === evento.id || selecionado?.id === evento.id;

          return (
            <Marker
              key={evento.id}
              coordinate={{ latitude: evento.latitude, longitude: evento.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges
              onPress={() => {
                ultimoToqueMarcador.current = Date.now();
                aoTocarMarcador(evento);
              }}
            >
              <MarcadorMapa categoria={evento.categoria} destacado={destacado} />
            </Marker>
          );
        })}
      </MapView>

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {eventos.map((evento) => {
          const ponto = pontos[evento.id];
          if (!ponto) return null;
          const lado = hoverId === evento.id || selecionado?.id === evento.id ? 52 : 44;

          return (
            <Pressable
              key={`hover-${evento.id}`}
              onHoverIn={() => setHoverId(evento.id)}
              onHoverOut={() => setHoverId((atual) => (atual === evento.id ? null : atual))}
              onPress={() => {
                ultimoToqueMarcador.current = Date.now();
                aoTocarMarcador(evento);
              }}
              style={{
                position: 'absolute',
                left: ponto.x - lado / 2,
                top: ponto.y - lado / 2,
                width: lado,
                height: lado,
              }}
            />
          );
        })}
      </View>

      {selecionado ? (
        <TouchableOpacity
          style={[styles.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}
          onPress={() => abrirEvento(selecionado)}
          activeOpacity={0.92}
        >
          {foto ? (
            <Image
              source={{ uri: foto }}
              style={styles.foto}
              contentFit={Platform.OS === 'web' ? 'contain' : 'cover'}
            />
          ) : null}
          <View style={styles.cartaoInfo}>
            <Text style={[styles.titulo, { color: cores.texto }]} numberOfLines={2}>
              {selecionado.titulo}
            </Text>
            <Text style={styles.meta}>
              {selecionado.categoria || 'Outros'} · {formatarInicio(selecionado.dataInicio)}
            </Text>
            <Text style={[styles.local, { color: cores.subtexto }]} numberOfLines={1}>
              📍 {selecionado.local}
            </Text>
            <Text style={[styles.descricao, { color: cores.subtexto }]} numberOfLines={2}>
              {selecionado.descricao}
            </Text>
            <Text style={styles.link}>Toque para abrir o evento</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.dica, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <Text style={[styles.dicaTexto, { color: cores.subtexto }]}>
            Passe o mouse ou toque no boneco para ver o evento
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  map: { width: '100%', height: '100%' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoCarregando: { marginTop: 10, color: '#666' },
  cartao: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  foto: {
    width: 86,
    height: 86,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  cartaoInfo: { flex: 1, minWidth: 0 },
  titulo: { fontSize: 16, fontWeight: 'bold' },
  meta: { color: '#28a745', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  local: { fontSize: 12, marginTop: 4 },
  descricao: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  link: { color: '#007bff', fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  dica: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dicaTexto: { fontSize: 13, textAlign: 'center' },
});
