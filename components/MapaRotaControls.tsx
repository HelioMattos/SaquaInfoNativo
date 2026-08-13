import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { PassoNavegacao } from '../utils/rota';
import { formatarDistancia, formatarDuracao, InfoRota } from '../utils/rota';

interface MapaRotaControlsProps {
  carregando: boolean;
  rota: InfoRota | null;
  isDark: boolean;
  navegando?: boolean;
  passoAtual?: PassoNavegacao | null;
  proximoPasso?: PassoNavegacao | null;
  distanciaFormatada?: string;
  onTracarRota: () => void;
  onIniciarNavegacao?: () => void;
  onPararNavegacao?: () => void;
  onLimparRota?: () => void;
}

export default function MapaRotaControls({
  carregando,
  rota,
  isDark,
  navegando = false,
  passoAtual,
  proximoPasso,
  distanciaFormatada,
  onTracarRota,
  onIniciarNavegacao,
  onPararNavegacao,
  onLimparRota,
}: MapaRotaControlsProps) {
  const subtexto = isDark ? '#aaa' : '#666';
  const fundo = isDark ? '#1e1e1e' : '#f8f9fa';
  const borda = isDark ? '#333' : '#eee';
  const texto = isDark ? '#fff' : '#333';

  return (
    <View style={{ marginTop: 12 }}>
      {!navegando && (
        <TouchableOpacity
          onPress={onTracarRota}
          disabled={carregando}
          style={{
            backgroundColor: '#007bff',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: carregando ? 0.7 : 1,
          }}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="navigate" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                {rota ? 'Recalcular rota' : 'Como chegar (minha localização)'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {rota && !navegando && onIniciarNavegacao && (
        <TouchableOpacity
          onPress={onIniciarNavegacao}
          style={{
            backgroundColor: '#28a745',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
          }}
        >
          <Ionicons name="volume-high" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
            Iniciar navegação com avisos
          </Text>
        </TouchableOpacity>
      )}

      {navegando && passoAtual && (
        <View
          style={{
            backgroundColor: '#007bff',
            padding: 16,
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="navigate-circle" size={28} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10, flex: 1 }}>
              {passoAtual.instrucao}
            </Text>
          </View>

          {distanciaFormatada && (
            <Text style={{ color: '#e6f0ff', fontSize: 14, marginBottom: 4 }}>
              Faltam aproximadamente {distanciaFormatada} para o destino
            </Text>
          )}

          {proximoPasso && (
            <Text style={{ color: '#cce0ff', fontSize: 13 }}>
              Depois: {proximoPasso.instrucaoCurta}
            </Text>
          )}
        </View>
      )}

      {navegando && onPararNavegacao && (
        <TouchableOpacity
          onPress={onPararNavegacao}
          style={{
            backgroundColor: '#dc3545',
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Parar navegação</Text>
        </TouchableOpacity>
      )}

      {rota && !navegando && (
        <View
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            backgroundColor: fundo,
            borderWidth: 1,
            borderColor: borda,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="car" size={18} color="#007bff" />
              <Text style={{ marginLeft: 6, color: subtexto, fontWeight: '600' }}>
                {formatarDistancia(rota.distanciaMetros)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time" size={18} color="#28a745" />
              <Text style={{ marginLeft: 6, color: subtexto, fontWeight: '600' }}>
                {formatarDuracao(rota.duracaoSegundos)}
              </Text>
            </View>
          </View>

          {onLimparRota && (
            <TouchableOpacity onPress={onLimparRota}>
              <Ionicons name="close-circle" size={22} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {rota && rota.passos.length > 0 && !navegando && (
        <View
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            backgroundColor: fundo,
            borderWidth: 1,
            borderColor: borda,
          }}
        >
          <Text style={{ color: texto, fontWeight: 'bold', marginBottom: 8 }}>
            Instruções do trajeto
          </Text>
          {rota.passos.slice(0, 5).map((passo, index) => (
            <Text key={index} style={{ color: subtexto, fontSize: 13, marginBottom: 4 }}>
              {index + 1}. {passo.instrucao} ({formatarDistancia(passo.distanciaMetros)})
            </Text>
          ))}
          {rota.passos.length > 5 && (
            <Text style={{ color: subtexto, fontSize: 12, marginTop: 4 }}>
              + {rota.passos.length - 5} instruções na navegação guiada
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
