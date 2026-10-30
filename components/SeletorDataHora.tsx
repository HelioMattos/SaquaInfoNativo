import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

interface SeletorDataHoraProps {
  value: Date;
  onChange: (date: Date) => void;
  dateTimeBtn: object;
  dateTimeText: object;
  dateTimeRow: object;
  isDark?: boolean;
}

export default function SeletorDataHora({
  value,
  onChange,
  dateTimeBtn,
  dateTimeText,
  dateTimeRow,
}: SeletorDataHoraProps) {
  const [showPicker, setShowPicker] = useState<{
    show: boolean;
    mode: 'date' | 'time';
  }>({ show: false, mode: 'date' });

  const onChangePicker = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker((prev) => ({ ...prev, show: false }));
    }
    if (event.type === 'dismissed' || !selectedDate) return;
    onChange(selectedDate);
  };

  return (
    <>
      <View style={dateTimeRow}>
        <TouchableOpacity
          style={dateTimeBtn}
          onPress={() => setShowPicker({ show: true, mode: 'date' })}
        >
          <Ionicons name="calendar" size={18} color="#007bff" />
          <Text style={dateTimeText}>{value.toLocaleDateString('pt-BR')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={dateTimeBtn}
          onPress={() => setShowPicker({ show: true, mode: 'time' })}
        >
          <Ionicons name="time" size={18} color="#007bff" />
          <Text style={dateTimeText}>
            {value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker.show && (
        <DateTimePicker
          value={value}
          mode={showPicker.mode}
          is24Hour
          display="default"
          onChange={onChangePicker}
        />
      )}
    </>
  );
}
