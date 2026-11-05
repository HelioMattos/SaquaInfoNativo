// Casca de WebView em volta do mapa Leaflet.
//
// O HTML vem de `montarHtmlMapa`. Este componente so cuida de:
//   - entregar o HTML ao WebView;
//   - traduzir `postMessage` do mapa em callback tipado;
//   - enfileirar comandos pedidos antes do mapa existir e despachar quando
//     a pagina avisa que esta pronta (evita perder a primeira chamada).

import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { MensagemMapa } from '../utils/mapaLeaflet';

export interface MapaLeafletRef {
  /** Roda uma chamada em `window.SaquaMapa` dentro do mapa. */
  executar: (javascript: string) => void;
}

interface MapaLeafletProps {
  html: string;
  onMensagem?: (mensagem: MensagemMapa) => void;
  style?: StyleProp<ViewStyle>;
  /** Necessario quando o mapa fica dentro de um ScrollView. */
  rolagemAninhada?: boolean;
}

const MapaLeaflet = forwardRef<MapaLeafletRef, MapaLeafletProps>(function MapaLeaflet(
  { html, onMensagem, style, rolagemAninhada = false },
  ref
) {
  const webviewRef = useRef<WebView>(null);
  const prontoRef = useRef(false);
  const filaRef = useRef<string[]>([]);

  const despachar = useCallback((javascript: string) => {
    // O `true;` no fim evita o aviso de retorno nao serializavel do WebView.
    webviewRef.current?.injectJavaScript(javascript + '; true;');
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      executar: (javascript: string) => {
        if (!prontoRef.current) {
          filaRef.current.push(javascript);
          return;
        }
        despachar(javascript);
      },
    }),
    [despachar]
  );

  const aoReceberMensagem = useCallback(
    (evento: { nativeEvent: { data: string } }) => {
      let mensagem: MensagemMapa;
      try {
        mensagem = JSON.parse(evento.nativeEvent.data) as MensagemMapa;
      } catch {
        return;
      }

      if (mensagem.tipo === 'pronto') {
        prontoRef.current = true;
        const pendentes = filaRef.current;
        filaRef.current = [];
        pendentes.forEach(despachar);
      }

      onMensagem?.(mensagem);
    },
    [despachar, onMensagem]
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webviewRef}
        // O baseUrl da uma origem http ao documento; sem isso o Android
        // bloqueia o <script> do Leaflet vindo da CDN.
        source={{ html, baseUrl: 'https://localhost/' }}
        originWhitelist={['*']}
        onMessage={aoReceberMensagem}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        // O mapa tem o proprio gesto de arraste e zoom.
        scrollEnabled={false}
        overScrollMode="never"
        nestedScrollEnabled={rolagemAninhada}
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback={false}
        style={styles.webview}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%', overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});

export default MapaLeaflet;
