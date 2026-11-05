import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { listarEventos } from '../lib/db/eventos';
import { Evento, eventoEstaAtivo, parseImagens } from '../types/evento';
import { getEmojiCategoria } from '../utils/mapa';
import { MensagemMapa, montarHtmlMapa } from '../utils/mapaLeaflet';
import MapaLeaflet, { MapaLeafletRef } from './MapaLeaflet';

interface Regiao {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const REGIAO_INICIAL: Regiao = {
  latitude: -22.9251,
  longitude: -42.4862,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const ZOOM_INICIAL = 13;

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
  const [regiao, setRegiao] = useState<Regiao>(REGIAO_INICIAL);
  const mapaRef = useRef<MapaLeafletRef>(null);
  const ultimoToqueMarcador = useRef(0);

  // Mantem os dados frescos dentro dos callbacks do mapa sem refazer o HTML.
  const eventosRef = useRef(eventos);
  eventosRef.current = eventos;
  const regiaoRef = useRef(regiao);
  regiaoRef.current = regiao;
  const selecionadoRef = useRef(selecionado);
  selecionadoRef.current = selecionado;

  const cores = {
    fundo: isDark ? '#121212' : '#fff',
    cartao: isDark ? '#1e1e1e' : '#fff',
    texto: isDark ? '#fff' : '#333',
    subtexto: isDark ? '#aaa' : '#666',
    borda: isDark ? '#333' : '#e5e5e5',
  };

  const html = useMemo(
    () =>
      montarHtmlMapa({
        latitude: REGIAO_INICIAL.latitude,
        longitude: REGIAO_INICIAL.longitude,
        zoom: ZOOM_INICIAL,
        isDark,
      }),
    [isDark]
  );

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

  // Redesenha os marcadores sempre que a lista de eventos muda.
  useEffect(() => {
    const marcadores = eventos
      .filter((evento) => evento.latitude && evento.longitude)
      .map((evento) => ({
        id: evento.id,
        latitude: evento.latitude,
        longitude: evento.longitude,
        emoji: getEmojiCategoria(evento.categoria),
      }));

    mapaRef.current?.executar(
      `window.SaquaMapa.definirMarcadores(${JSON.stringify(marcadores)})`
    );
  }, [eventos]);

  // Aumenta o marcador do evento selecionado.
  useEffect(() => {
    mapaRef.current?.executar(
      `window.SaquaMapa.destacar(${JSON.stringify(selecionado?.id ?? null)})`
    );
  }, [selecionado]);

  const abrirEvento = useCallback(
    (evento: Evento) => {
      router.push({
        pathname: '/modal',
        params: { id: evento.id },
      });
    },
    [router]
  );

  const aoTocarMarcador = useCallback(
    (evento: Evento) => {
      if (selecionadoRef.current?.id === evento.id) {
        abrirEvento(evento);
        return;
      }
      setSelecionado(evento);
    },
    [abrirEvento]
  );

  const aoTocarMapa = useCallback(
    (latitude: number, longitude: number) => {
      if (Date.now() - ultimoToqueMarcador.current < 400) return;

      const atual = regiaoRef.current;
      const raio = Math.max(atual.latitudeDelta, atual.longitudeDelta) * 0.18;
      const evento = eventoMaisProximo(eventosRef.current, latitude, longitude, raio);
      if (!evento) {
        setSelecionado(null);
        return;
      }
      aoTocarMarcador(evento);
    },
    [aoTocarMarcador]
  );

  const aoReceberMensagem = useCallback(
    (mensagem: MensagemMapa) => {
      if (mensagem.tipo === 'marcador') {
        const evento = eventosRef.current.find((item) => item.id === mensagem.id);
        if (!evento) return;
        ultimoToqueMarcador.current = Date.now();
        aoTocarMarcador(evento);
        return;
      }

      if (mensagem.tipo === 'clique') {
        aoTocarMapa(mensagem.latitude, mensagem.longitude);
        return;
      }

      if (mensagem.tipo === 'movimento') {
        setRegiao((anterior) => ({
          ...anterior,
          latitudeDelta: mensagem.latitudeDelta,
          longitudeDelta: mensagem.longitudeDelta,
        }));
      }
    },
    [aoTocarMapa, aoTocarMarcador]
  );

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
      <MapaLeaflet
        ref={mapaRef}
        html={html}
        onMensagem={aoReceberMensagem}
        style={styles.map}
      />

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
            Toque no marcador para ver o evento
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
