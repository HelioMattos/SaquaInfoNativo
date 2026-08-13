import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapaCustomizado from '../components/MapaCustomizado';
import SeletorDataHora from '../components/SeletorDataHora';
import SeletorFotos from '../components/SeletorFotos';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';
import { useAdmin } from '../hooks/useAdmin';
import { getCadastrarStyles } from '../styles/cadastrar.styles';
import { parseImagens } from '../types/evento';
import { prepararListaImagens } from '../utils/imagens';

export default function CadastrarEvento() {
  const { isDark } = useTheme();
  const styles = getCadastrarStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAdmin, loading: loadingAdmin } = useAdmin();

  const isEdicao = Boolean(params.id);

  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [coordenadas, setCoordenadas] = useState({ latitude: -22.9251, longitude: -42.4862 });
  const [carregando, setCarregando] = useState(false);
  const [processandoFotos, setProcessandoFotos] = useState(false);
  const [carregandoEvento, setCarregandoEvento] = useState(isEdicao);

  const [fotos, setFotos] = useState<string[]>(['', '', '']);

  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataTermino, setDataTermino] = useState(new Date());

  const categorias = [
    { id: 'Esportes', icon: 'fitness' },
    { id: 'Show', icon: 'musical-notes' },
    { id: 'Comida', icon: 'restaurant' },
    { id: 'Religioso', icon: 'bonfire' },
    { id: 'Cultural', icon: 'library' },
    { id: 'Outros', icon: 'help-circle' },
  ];

  useEffect(() => {
    if (loadingAdmin) return;
    if (!isAdmin) {
      router.replace('/(tabs)');
    }
  }, [isAdmin, loadingAdmin]);

  useEffect(() => {
    if (!isEdicao || !params.id) return;

    const carregarEvento = async () => {
      try {
        const snap = await getDoc(doc(db, 'eventos', params.id as string));
        if (!snap.exists()) return;

        const data = snap.data();
        setTitulo(data.titulo || '');
        setLocal(data.local || '');
        setDescricao(data.descricao || '');
        setCategoria(data.categoria || 'Outros');
        setCoordenadas({
          latitude: data.latitude ?? -22.9251,
          longitude: data.longitude ?? -42.4862,
        });
        if (data.dataInicio) setDataInicio(new Date(data.dataInicio));
        if (data.dataTermino) setDataTermino(new Date(data.dataTermino));

        const imgs = parseImagens(data.imagens);
        setFotos([imgs[0] || '', imgs[1] || '', imgs[2] || '']);
      } finally {
        setCarregandoEvento(false);
      }
    };

    carregarEvento();
  }, [isEdicao, params.id]);

  const handleSalvar = async () => {
    if (!titulo || !local || !descricao || !fotos[0]) {
      return Alert.alert('Atenção', 'Preencha Título, Local, Descrição e ao menos a primeira foto.');
    }

    setCarregando(true);
    setProcessandoFotos(true);

    try {
      const listaFotos = await prepararListaImagens(fotos);

      const dados = {
        titulo,
        local,
        descricao,
        categoria,
        imagens: listaFotos,
        dataInicio: dataInicio.toISOString(),
        dataTermino: dataTermino.toISOString(),
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
        atualizadoEm: serverTimestamp(),
      };

      if (isEdicao) {
        await updateDoc(doc(db, 'eventos', params.id as string), dados);
      } else {
        await addDoc(collection(db, 'eventos'), { ...dados, criadoEm: serverTimestamp() });
      }

      router.back();
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : 'Não foi possível salvar o evento. Tente novamente.';
      Alert.alert('Erro ao salvar', mensagem);
    } finally {
      setCarregando(false);
      setProcessandoFotos(false);
    }
  };

  if (loadingAdmin || !isAdmin || carregandoEvento) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.headerTitle}>{isEdicao ? 'Editar Evento' : 'Novo Evento'}</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholderTextColor={styles.colors.placeholder}
          placeholder="Nome do evento"
        />

        <Text style={styles.label}>Local (Endereço ou Nome do Estabelecimento)</Text>
        <TextInput
          style={styles.input}
          value={local}
          onChangeText={setLocal}
          placeholderTextColor={styles.colors.placeholder}
          placeholder="Ex: Praia de Itaúna"
        />

        <Text style={styles.label}>Fotos do evento</Text>
        <Text style={{ color: styles.colors.placeholder, fontSize: 12, marginBottom: 8 }}>
          Toque para usar a câmera ou escolher da galeria. As fotos ficam salvas no banco, sem custo extra.
        </Text>
        <SeletorFotos fotos={fotos} onChange={setFotos} isDark={isDark} obrigatoria />

        <Text style={styles.label}>Data e Hora de Início</Text>
        <SeletorDataHora
          value={dataInicio}
          onChange={setDataInicio}
          isDark={isDark}
          dateTimeRow={styles.dateTimeRow}
          dateTimeBtn={styles.dateTimeBtn}
          dateTimeText={styles.dateTimeText}
        />

        <Text style={styles.label}>Data e Hora de Término</Text>
        <SeletorDataHora
          value={dataTermino}
          onChange={setDataTermino}
          isDark={isDark}
          dateTimeRow={styles.dateTimeRow}
          dateTimeBtn={styles.dateTimeBtn}
          dateTimeText={styles.dateTimeText}
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoriaContainer}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catBadge, categoria === cat.id && styles.catBadgeSelected]}
              onPress={() => setCategoria(cat.id)}
            >
              <View style={styles.catBadgeInner}>
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={categoria === cat.id ? '#fff' : styles.colors.texto}
                />
                <Text style={[styles.catText, categoria === cat.id && styles.catTextSelected]}>
                  {cat.id}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          placeholderTextColor={styles.colors.placeholder}
          placeholder="Detalhes..."
        />

        <Text style={styles.label}>Toque no mapa para marcar o local exato</Text>
        <Text style={{ color: styles.colors.placeholder, fontSize: 12, marginBottom: 6 }}>
          Lat: {coordenadas.latitude.toFixed(5)} | Lng: {coordenadas.longitude.toFixed(5)}
        </Text>
        <View style={styles.mapContainer}>
          <MapaCustomizado coordenadas={coordenadas} setCoordenadas={setCoordenadas} isDark={isDark} />
        </View>

        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={carregando}>
            <Text style={styles.buttonText}>
              {processandoFotos ? 'PROCESSANDO FOTOS...' : carregando ? 'SALVANDO...' : 'SALVAR EVENTO'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()} disabled={carregando}>
            <Text style={styles.buttonTextCancel}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
