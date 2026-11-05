import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useNavegacao } from '../hooks/useNavegacao';
import { getEmojiCategoria } from '../utils/mapa';
import { MensagemMapa, montarHtmlMapa } from '../utils/mapaLeaflet';
import { Coordenada } from '../utils/rota';
import MapaLeaflet, { MapaLeafletRef } from './MapaLeaflet';
import MapaRotaControls from './MapaRotaControls';

const ZOOM_EVENTO = 15;
const ZOOM_NAVEGACAO = 16;

interface MapaModalProps {
  latitude: number;
  longitude: number;
  titulo: string;
  categoria?: string;
  isDark: boolean;
  styles: {
    mapWrapper: object;
    mapWrapperRota?: object;
    map: object;
  };
}

export default function MapaModal({
  latitude,
  longitude,
  titulo,
  categoria,
  isDark,
  styles,
}: MapaModalProps) {
  const mapaRef = useRef<MapaLeafletRef>(null);
  const destino: Coordenada = useMemo(() => ({ latitude, longitude }), [latitude, longitude]);

  const html = useMemo(
    () =>
      montarHtmlMapa({
        latitude,
        longitude,
        zoom: ZOOM_EVENTO,
        isDark,
      }),
    [latitude, longitude, isDark]
  );

  const onCentralizarMapa = useCallback((posicao: Coordenada) => {
    mapaRef.current?.executar(
      `window.SaquaMapa.centralizar(${posicao.latitude}, ${posicao.longitude}, ${ZOOM_NAVEGACAO})`
    );
  }, []);

  const {
    rota,
    minhaPosicao,
    carregando,
    navegando,
    passoAtual,
    proximoPasso,
    distanciaFormatada,
    tracarRota,
    iniciarNavegacao,
    pararNavegacao,
    limparRota,
  } = useNavegacao({ destino, onCentralizarMapa });

  // Marcador do evento. O titulo vira rotulo do marcador, como no
  // `<Marker title={titulo}>` da versao anterior.
  useEffect(() => {
    mapaRef.current?.executar(
      `window.SaquaMapa.definirMarcadorUnico(${latitude}, ${longitude}, ${JSON.stringify(
        getEmojiCategoria(categoria)
      )}, ${JSON.stringify(titulo)})`
    );
  }, [latitude, longitude, categoria, titulo]);

  useEffect(() => {
    if (!minhaPosicao) {
      mapaRef.current?.executar('window.SaquaMapa.definirMinhaPosicao(null, null)');
      return;
    }
    mapaRef.current?.executar(
      `window.SaquaMapa.definirMinhaPosicao(${minhaPosicao.latitude}, ${minhaPosicao.longitude})`
    );
  }, [minhaPosicao]);

  useEffect(() => {
    if (!rota) {
      mapaRef.current?.executar('window.SaquaMapa.definirRota(null)');
      return;
    }
    const pontos = rota.coordenadas.map((ponto) => [ponto.latitude, ponto.longitude]);
    mapaRef.current?.executar(`window.SaquaMapa.definirRota(${JSON.stringify(pontos)})`);
  }, [rota]);

  const handleTracarRota = async () => {
    const resultado = await tracarRota();
    if (!resultado) return;

    const { origem, infoRota } = resultado;
    const pontos = [origem, destino, ...infoRota.coordenadas].map((ponto) => [
      ponto.latitude,
      ponto.longitude,
    ]);
    mapaRef.current?.executar(`window.SaquaMapa.ajustarPara(${JSON.stringify(pontos)})`);
  };

  const handleLimparRota = () => {
    limparRota();
    mapaRef.current?.executar(
      `window.SaquaMapa.centralizar(${latitude}, ${longitude}, ${ZOOM_EVENTO})`
    );
  };

  // O mapa nao usa o retorno do toque nesta tela, mas o callback mantem o
  // contrato do componente e evita avisos de mensagem nao tratada.
  const aoReceberMensagem = useCallback((_mensagem: MensagemMapa) => {}, []);

  return (
    <View>
      <View
        style={[
          styles.mapWrapper as StyleProp<ViewStyle>,
          (rota || navegando) && (styles.mapWrapperRota as StyleProp<ViewStyle>),
        ]}
      >
        <MapaLeaflet
          ref={mapaRef}
          html={html}
          onMensagem={aoReceberMensagem}
          style={styles.map as StyleProp<ViewStyle>}
          rolagemAninhada
        />
      </View>

      <MapaRotaControls
        carregando={carregando}
        rota={rota}
        isDark={isDark}
        navegando={navegando}
        passoAtual={passoAtual}
        proximoPasso={proximoPasso}
        distanciaFormatada={distanciaFormatada}
        onTracarRota={handleTracarRota}
        onIniciarNavegacao={iniciarNavegacao}
        onPararNavegacao={pararNavegacao}
        onLimparRota={rota ? handleLimparRota : undefined}
      />
    </View>
  );
}
