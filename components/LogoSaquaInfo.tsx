import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const appIcon = require('../assets/images/icon.png');

interface LogoSaquaInfoProps {
  fontSize?: number;
  iconSize?: number;
  color?: string;
}

export default function LogoSaquaInfo({
  fontSize = 22,
  iconSize = 30,
  color = '#007bff',
}: LogoSaquaInfoProps) {
  return (
    <View style={styles.row}>
      <Image
        source={appIcon}
        style={{ width: iconSize, height: iconSize, borderRadius: iconSize / 2 }}
        contentFit="cover"
      />
      <Text style={[styles.text, { fontSize, color, marginLeft: 8 }]}>SaquaInfo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});
