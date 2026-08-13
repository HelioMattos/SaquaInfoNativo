import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapaCustomizadoProps {
  coordenadas: { latitude: number; longitude: number };
  setCoordenadas: (coords: { latitude: number; longitude: number }) => void;
  isDark?: boolean;
}

export default function MapaCustomizado({ coordenadas, setCoordenadas, isDark }: MapaCustomizadoProps) {
  const [region, setRegion] = useState({
    ...coordenadas,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    setRegion({
      ...coordenadas,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [coordenadas.latitude, coordenadas.longitude]);

  return (
    <MapView
      style={styles.map}
      userInterfaceStyle={isDark ? 'dark' : 'light'}
      region={region}
      onRegionChangeComplete={setRegion}
      onPress={(e) => setCoordenadas(e.nativeEvent.coordinate)}
    >
      <Marker
        coordinate={coordenadas}
        draggable
        onDragEnd={(e) => setCoordenadas(e.nativeEvent.coordinate)}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%', borderRadius: 10 },
});
