import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CampoSenha from '../components/CampoSenha';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mostrarAlerta } from '../utils/mensagens';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();
  const { login } = useAuth();

  const estiloInput = {
    backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
    color: isDark ? '#fff' : '#333',
    borderColor: isDark ? '#333' : '#ddd',
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      return mostrarAlerta('Atenção', 'Preencha e-mail e senha.');
    }

    setCarregando(true);
    try {
      await login(email, senha);
      router.replace('/(tabs)');
    } catch {
      mostrarAlerta('Erro', 'Usuário ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  const handleEsqueciSenha = () => {
    mostrarAlerta(
      'Recuperação local',
      'No modo offline, a senha fica no banco local do dispositivo. Peça a um administrador para recriar o acesso ou reinstale o app se for uma conta de teste.'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#333'} />
      </TouchableOpacity>

      <Text style={[styles.titulo, { color: isDark ? '#fff' : '#007bff' }]}>SaquaInfo</Text>

      <View style={styles.inputArea}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#666' }]}>E-mail</Text>
        <TextInput
          style={[styles.input, estiloInput]}
          placeholder="exemplo@email.com"
          placeholderTextColor={isDark ? '#888' : '#bbb'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { color: isDark ? '#aaa' : '#666' }]}>Senha</Text>
        <CampoSenha
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          isDark={isDark}
          style={{ marginBottom: 0 }}
        />
      </View>

      <TouchableOpacity style={styles.botao} onPress={handleLogin} disabled={carregando}>
        {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>ENTRAR</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/registrar')} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: 'center', color: isDark ? '#aaa' : '#666' }}>
          Não tem uma conta? <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Cadastre-se</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleEsqueciSenha} style={{ marginTop: 20 }}>
        <Text style={{ color: '#007bff', textAlign: 'center', fontSize: 13, textDecorationLine: 'underline' }}>
          Esqueci minha senha
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  titulo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  inputArea: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15 },
  botao: { backgroundColor: '#007bff', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  botaoTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
