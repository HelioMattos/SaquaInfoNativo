import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface CampoSenhaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isDark: boolean;
  style?: object;
}

export default function CampoSenha({ value, onChangeText, placeholder, isDark, style }: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#333' : '#ddd',
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#888' : '#bbb'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visivel}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.icone}
        onPress={() => setVisivel((atual) => !atual)}
        accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        <Ionicons
          name={visivel ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={isDark ? '#aaa' : '#666'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    padding: 15,
    paddingRight: 50,
    borderRadius: 12,
    fontSize: 16,
  },
  icone: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
