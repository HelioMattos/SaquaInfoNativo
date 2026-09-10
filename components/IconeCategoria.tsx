import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

interface IconeCategoriaProps {
  categoria?: string;
  size?: number;
  color?: string;
}

export default function IconeCategoria({
  categoria,
  size = 18,
  color = '#fff',
}: IconeCategoriaProps) {
  switch (categoria) {
    case 'Esportes':
      return <FontAwesome5 name="running" size={size} color={color} />;
    case 'Show':
      return <MaterialCommunityIcons name="account-music" size={size} color={color} />;
    case 'Comida':
      return <MaterialCommunityIcons name="chef-hat" size={size} color={color} />;
    case 'Religioso':
      return <FontAwesome5 name="pray" size={size} color={color} />;
    case 'Cultural':
      return <FontAwesome5 name="book-reader" size={size} color={color} />;
    default:
      return <MaterialCommunityIcons name="map-marker" size={size} color={color} />;
  }
}
