import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { desprojetar, pontoNoMapa, tilesVisiveis, ZOOM_PADRAO } from './mapaImagem';

export interface MarcadorMapa {
  id: string;
  latitude: number;
  longitude: number;
  titulo: string;
}

interface MapaTilesProps {
  latitude: number;
  longitude: number;
  onChange?: (coordenada: { latitude: number; longitude: number }) => void;
  marcadores?: MarcadorMapa[];
  onSelecionar?: (id: string) => void;
  altura?: number;
}

export default function MapaTiles({
  latitude,
  longitude,
  onChange,
  marcadores = [],
  onSelecionar,
  altura = 280,
}: MapaTilesProps) {
  const [zoom, setZoom] = useState(ZOOM_PADRAO);
  const [aviso, setAviso] = useState('');
  const [fonte, setFonte] = useState<'carto' | 'esri'>('carto');
  const [largura, setLargura] = useState(0);
  const grade = tilesVisiveis(latitude, longitude, zoom, fonte);
  const alturaMapa = largura > 0 ? largura : altura;
  const tileLado = largura > 0 ? largura / 3 : 0;

  const mover = (norte: number, leste: number) => {
    if (!onChange) return;
    const passo = 120 / 2 ** zoom;
    onChange({
      latitude: Math.min(85, Math.max(-85, latitude + norte * passo)),
      longitude: longitude + leste * passo,
    });
  };

  const usarMinhaLocalizacao = async () => {
    if (!onChange) return;
    const permissao = await Location.requestForegroundPermissionsAsync();
    if (!permissao.granted) {
      setAviso('Permita a localização para marcar onde você está.');
      return;
    }
    const posicao = await Location.getCurrentPositionAsync({});
    onChange({
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude,
    });
    setAviso('Ponto marcado na sua localização.');
  };

  const marcarToque = (locationX: number, locationY: number) => {
    if (!onChange || largura <= 0) return;
    onChange(
      desprojetar(
        grade.origemX + (locationX / largura) * 3,
        grade.origemY + (locationY / alturaMapa) * 3,
        zoom
      )
    );
    setAviso('Ponto marcado no mapa.');
  };

  return (
    <View>
      <View style={[styles.mapa, { height: alturaMapa }]} onLayout={(evento) => setLargura(evento.nativeEvent.layout.width)}>
        <View style={styles.grade} pointerEvents="none">
          {tileLado > 0
            ? grade.tiles.map((tile, indice) => (
                <Image
                  key={tile.key}
                  style={{
                    position: 'absolute',
                    left: (indice % 3) * tileLado,
                    top: Math.floor(indice / 3) * tileLado,
                    width: tileLado,
                    height: tileLado,
                  }}
                  source={{ uri: tile.url }}
                  resizeMode="cover"
                  onError={() => setFonte('esri')}
                />
              ))
            : null}
        </View>
        {onChange ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={(evento) => marcarToque(evento.nativeEvent.locationX, evento.nativeEvent.locationY)}
          />
        ) : null}
        {largura > 0
          ? marcadores.map((marcador) => {
              const ponto = pontoNoMapa(
                marcador.latitude,
                marcador.longitude,
                grade.origemX,
                grade.origemY,
                zoom,
                largura,
                alturaMapa
              );
              if (ponto.left < 8 || ponto.top < 8 || ponto.left > largura - 8 || ponto.top > alturaMapa - 8) {
                return null;
              }
              return (
                <TouchableOpacity
                  key={marcador.id}
                  style={[styles.pin, { left: ponto.left - 18, top: ponto.top - 18 }]}
                  onPress={() => onSelecionar?.(marcador.id)}
                >
                  <Text style={styles.pinTexto}>📍</Text>
                </TouchableOpacity>
              );
            })
          : null}
        {onChange && largura > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.pin,
              pontoNoMapa(latitude, longitude, grade.origemX, grade.origemY, zoom, largura, alturaMapa),
              { marginLeft: -14, marginTop: -28 },
            ]}
          >
            <Ionicons name="location" size={28} color="#dc3545" />
          </View>
        ) : null}
      </View>
      <Text style={styles.dica}>
        {onChange ? 'Toque no mapa para marcar o ponto do evento.' : 'Toque no marcador para abrir o evento.'}
      </Text>
      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
      <Text style={styles.coords}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
      {onChange ? (
        <View style={styles.acoes}>
          <TouchableOpacity style={styles.botao} onPress={() => mover(1, 0)}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={() => mover(-1, 0)}>
            <Ionicons name="arrow-down" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={() => mover(0, -1)}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={() => mover(0, 1)}>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={() => setZoom((valor) => Math.min(17, valor + 1))}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={() => setZoom((valor) => Math.max(12, valor - 1))}>
            <Ionicons name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.local} onPress={() => void usarMinhaLocalizacao()}>
            <Ionicons name="locate" size={18} color="#fff" />
            <Text style={styles.localTexto}>Minha localização</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapa: { width: '100%', backgroundColor: '#d9e2ec', overflow: 'hidden', borderRadius: 12 },
  grade: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', flexWrap: 'wrap' },
  pin: { position: 'absolute', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pinTexto: { fontSize: 22 },
  aviso: { color: '#856404', marginTop: 8 },
  dica: { color: '#666', marginTop: 8, fontSize: 13 },
  coords: { color: '#666', fontSize: 12, marginTop: 4 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  botao: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  local: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  localTexto: { color: '#fff', fontWeight: 'bold' },
});
