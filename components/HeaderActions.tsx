import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderActionsProps {
  showThemeToggle?: boolean;
}

export default function HeaderActions({ showThemeToggle = false }: HeaderActionsProps) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {showThemeToggle && (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 12 }}>
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={24}
            color={isDark ? '#ffcc00' : '#333'}
          />
        </TouchableOpacity>
      )}

      {!isLoggedIn ? (
        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={{
            backgroundColor: '#007bff',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Entrar</Text>
        </TouchableOpacity>
      ) : (
        isAdmin && (
          <TouchableOpacity
            onPress={() => router.push('/cadastrar')}
            style={{
              backgroundColor: '#007bff',
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        )
      )}
    </View>
  );
}
