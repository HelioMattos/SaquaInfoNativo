import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapaExplore from '../../components/MapaExplore';
import { useTheme } from '../../context/ThemeContext';

export default function ExploreScreen() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <MapaExplore />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
