import React from 'react';
import MapaTiles from './MapaTiles';

interface MapaCustomizadoProps {
  coordenadas: { latitude: number; longitude: number };
  setCoordenadas: (coords: { latitude: number; longitude: number }) => void;
  isDark?: boolean;
}

export default function MapaCustomizado({ coordenadas, setCoordenadas }: MapaCustomizadoProps) {
  return (
    <MapaTiles
      latitude={coordenadas.latitude}
      longitude={coordenadas.longitude}
      onChange={setCoordenadas}
    />
  );
}
