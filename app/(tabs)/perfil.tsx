import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPerfilStyles } from '../../styles/perfil.styles';
import { confirmarLogout, fazerLogout } from '../../utils/authActions';

export default function PerfilScreen() {
  const { isDark, toggleTheme } = useTheme();
  const styles = getPerfilStyles(isDark);
  const { user, isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    confirmarLogout(async () => {
      await fazerLogout();
    });
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { justifyContent: 'center' }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={50} color="#fff" />
          </View>
          <Text style={styles.userName}>Visitante</Text>
          <Text style={[styles.userEmail, { textAlign: 'center', marginBottom: 30 }]}>
            Faça login para acessar sua conta e, se for administrador, gerenciar eventos.
          </Text>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#007bff' }]}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>ENTRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoRow} onPress={() => router.push('/qr')}>
            <Ionicons name="qr-code-outline" size={24} color="#007bff" />
            <Text style={styles.infoText}>QR Code do app</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.infoRow, styles.infoRowVisitante]} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={isDark ? '#ffcc00' : '#555'} />
            <Text style={styles.infoText}>Tema: {isDark ? 'Escuro' : 'Claro'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.userName}>Bem-vindo!</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#007bff" />
            <Text style={styles.infoText}>Perfil: {isAdmin ? 'Administrador' : 'Usuário'}</Text>
          </View>

          {isAdmin && (
            <TouchableOpacity style={styles.infoRow} onPress={() => router.push('/cadastrar')}>
              <Ionicons name="add-circle-outline" size={24} color="#007bff" />
              <Text style={styles.infoText}>Cadastrar novo evento</Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={24} color="#007bff" />
            <Text style={styles.infoText}>Localização: Saquarema, RJ</Text>
          </View>

          <TouchableOpacity style={styles.infoRow} onPress={() => router.push('/qr')}>
            <Ionicons name="qr-code-outline" size={24} color="#007bff" />
            <Text style={styles.infoText}>QR Code do app</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoRow} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={isDark ? '#ffcc00' : '#555'} />
            <Text style={styles.infoText}>Tema: {isDark ? 'Escuro' : 'Claro'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
