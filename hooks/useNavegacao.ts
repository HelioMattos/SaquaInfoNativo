import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { obterLocalizacaoAtual } from './useLocalizacao';
import { falar, pararFala } from '../utils/falar';
import {
  buscarRota,
  Coordenada,
  distanciaEntre,
  formatarDistancia,
  InfoRota,
} from '../utils/rota';

interface UseNavegacaoOptions {
  destino: Coordenada;
  onPosicaoAtualizada?: (posicao: Coordenada) => void;
  onCentralizarMapa?: (posicao: Coordenada) => void;
}

export function useNavegacao({
  destino,
  onPosicaoAtualizada,
  onCentralizarMapa,
}: UseNavegacaoOptions) {
  const [rota, setRota] = useState<InfoRota | null>(null);
  const [minhaPosicao, setMinhaPosicao] = useState<Coordenada | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [navegando, setNavegando] = useState(false);
  const [passoIndex, setPassoIndex] = useState(0);
  const [distanciaRestante, setDistanciaRestante] = useState(0);

  const watchRef = useRef<Location.LocationSubscription | number | null>(null);
  const avisoProximoRef = useRef(false);
  const passoIndexRef = useRef(0);
  const navegandoRef = useRef(false);
  const rotaRef = useRef<InfoRota | null>(null);

  const atualizarPosicao = useCallback(
    (posicao: Coordenada) => {
      setMinhaPosicao(posicao);
      onPosicaoAtualizada?.(posicao);
      setDistanciaRestante(distanciaEntre(posicao, destino));

      if (navegandoRef.current) {
        onCentralizarMapa?.(posicao);
      }
    },
    [destino, onCentralizarMapa, onPosicaoAtualizada]
  );

  const processarNavegacao = useCallback(
    (posicao: Coordenada) => {
      const rotaAtual = rotaRef.current;
      if (!navegandoRef.current || !rotaAtual) return;

      const index = passoIndexRef.current;
      const passo = rotaAtual.passos[index];
      if (!passo) return;

      const distanciaPasso = distanciaEntre(posicao, passo.coordenada);
      const distanciaDestino = distanciaEntre(posicao, destino);

      if (distanciaDestino < 35) {
        falar('Você chegou ao destino');
        pararNavegacaoInterno();
        return;
      }

      if (distanciaPasso < 80 && !avisoProximoRef.current && index < rotaAtual.passos.length - 1) {
        avisoProximoRef.current = true;
        const proximo = rotaAtual.passos[index + 1];
        falar(`Em ${Math.round(distanciaPasso)} metros, ${proximo.instrucaoCurta}`);
      }

      if (distanciaPasso < 25 && index < rotaAtual.passos.length - 1) {
        const novoIndex = index + 1;
        passoIndexRef.current = novoIndex;
        setPassoIndex(novoIndex);
        avisoProximoRef.current = false;
        falar(rotaAtual.passos[novoIndex].instrucao);
      }
    },
    [destino]
  );

  const pararWatch = useCallback(() => {
    if (watchRef.current !== null) {
      if (Platform.OS === 'web') {
        navigator.geolocation.clearWatch(watchRef.current as number);
      } else {
        (watchRef.current as Location.LocationSubscription).remove();
      }
      watchRef.current = null;
    }
  }, []);

  const pararNavegacaoInterno = useCallback(() => {
    navegandoRef.current = false;
    setNavegando(false);
    pararWatch();
    pararFala();
    avisoProximoRef.current = false;
  }, [pararWatch]);

  const iniciarWatch = useCallback(async () => {
    pararWatch();

    if (Platform.OS === 'web') {
      if (!navigator.geolocation) return;

      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coordenada = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          atualizarPosicao(coordenada);
          processarNavegacao(coordenada);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Ative a localização para usar a navegação guiada.');
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 3000,
      },
      (pos) => {
        const coordenada = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        atualizarPosicao(coordenada);
        processarNavegacao(coordenada);
      }
    );
  }, [atualizarPosicao, pararWatch, processarNavegacao]);

  const tracarRota = async () => {
    setCarregando(true);
    try {
      const origem = await obterLocalizacaoAtual();
      if (!origem) return;

      const infoRota = await buscarRota(origem, destino);
      if (!infoRota) {
        Alert.alert('Rota indisponível', 'Não foi possível calcular o trajeto. Tente novamente.');
        return;
      }

      rotaRef.current = infoRota;
      setRota(infoRota);
      passoIndexRef.current = 0;
      setPassoIndex(0);
      atualizarPosicao(origem);

      return { origem, infoRota };
    } finally {
      setCarregando(false);
    }
  };

  const iniciarNavegacao = async () => {
    if (!rotaRef.current) return;

    if (Platform.OS !== 'web') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Ative a localização para usar a navegação guiada.');
        return;
      }
    }

    navegandoRef.current = true;
    setNavegando(true);
    passoIndexRef.current = 0;
    setPassoIndex(0);
    avisoProximoRef.current = false;

    const primeiroPasso = rotaRef.current.passos[0];
    falar(primeiroPasso?.instrucao || 'Navegação iniciada. Siga em frente.');

    await iniciarWatch();
  };

  const pararNavegacao = () => {
    pararNavegacaoInterno();
  };

  const limparRota = () => {
    pararNavegacaoInterno();
    rotaRef.current = null;
    setRota(null);
    setMinhaPosicao(null);
    setPassoIndex(0);
    passoIndexRef.current = 0;
    setDistanciaRestante(0);
  };

  const passoAtual = rota?.passos[passoIndex] || null;
  const proximoPasso = rota?.passos[passoIndex + 1] || null;

  return {
    rota,
    minhaPosicao,
    carregando,
    navegando,
    passoAtual,
    proximoPasso,
    passoIndex,
    distanciaRestante: distanciaRestante > 0 ? distanciaRestante : rota?.distanciaMetros || 0,
    distanciaFormatada: formatarDistancia(
      distanciaRestante > 0 ? distanciaRestante : rota?.distanciaMetros || 0
    ),
    tracarRota,
    iniciarNavegacao,
    pararNavegacao,
    limparRota,
  };
}
