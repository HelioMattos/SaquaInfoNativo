import { Ionicons } from '@expo/vector-icons';
import React, { type CSSProperties } from 'react';
import { Text, View } from 'react-native';

interface SeletorDataHoraProps {
  value: Date;
  onChange: (date: Date) => void;
  dateTimeBtn: object;
  dateTimeText: object;
  dateTimeRow: object;
  isDark?: boolean;
}

function formatarDataInput(date: Date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarHoraInput(date: Date) {
  const hora = String(date.getHours()).padStart(2, '0');
  const minuto = String(date.getMinutes()).padStart(2, '0');
  return `${hora}:${minuto}`;
}

export default function SeletorDataHora({
  value,
  onChange,
  dateTimeRow,
  isDark = false,
}: SeletorDataHoraProps) {
  const corFundo = isDark ? '#1e1e1e' : '#f0f7ff';
  const corBorda = isDark ? '#333' : '#ddd';
  const corTexto = isDark ? '#fff' : '#333';

  const estiloInput: CSSProperties = {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: `1px solid ${corBorda}`,
    backgroundColor: corFundo,
    color: corTexto,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: 0,
  };

  const alterarData = (texto: string) => {
    const [ano, mes, dia] = texto.split('-').map(Number);
    if (!ano || !mes || !dia) return;
    const nova = new Date(value);
    nova.setFullYear(ano, mes - 1, dia);
    onChange(nova);
  };

  const alterarHora = (texto: string) => {
    const [hora, minuto] = texto.split(':').map(Number);
    if (Number.isNaN(hora) || Number.isNaN(minuto)) return;
    const nova = new Date(value);
    nova.setHours(hora, minuto, 0, 0);
    onChange(nova);
  };

  return (
    <View style={[dateTimeRow, { alignItems: 'center' }]}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="calendar" size={18} color="#007bff" />
        <input
          type="date"
          value={formatarDataInput(value)}
          onChange={(e) => alterarData(e.target.value)}
          style={estiloInput}
          aria-label="Data"
        />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="time" size={18} color="#007bff" />
        <input
          type="time"
          value={formatarHoraInput(value)}
          onChange={(e) => alterarHora(e.target.value)}
          style={estiloInput}
          aria-label="Hora"
        />
      </View>
    </View>
  );
}
