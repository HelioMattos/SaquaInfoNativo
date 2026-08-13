import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import HeaderActions from '../../components/HeaderActions';
import LogoSaquaInfo from '../../components/LogoSaquaInfo';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007bff',
        headerTitle: () => (
          <LogoSaquaInfo color={isDark ? '#fff' : '#007bff'} iconSize={26} fontSize={20} />
        ),
        headerStyle: { backgroundColor: isDark ? '#1e1e1e' : '#fff' },
        headerTintColor: isDark ? '#fff' : '#333',
        headerRight: () => <HeaderActions />,
        tabBarStyle: { backgroundColor: isDark ? '#1e1e1e' : '#fff' },
        tabBarInactiveTintColor: isDark ? '#888' : '#999',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Eventos',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
