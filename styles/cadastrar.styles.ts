import { StyleSheet } from 'react-native';

export const getCadastrarStyles = (isDark: boolean) => {
  const theme = {
    fundo: isDark ? '#121212' : '#fff',
    texto: isDark ? '#fff' : '#333',
    inputFundo: isDark ? '#1e1e1e' : '#f9f9f9',
    inputBorder: isDark ? '#333' : '#ddd',
    placeholder: isDark ? '#888' : '#bbb',
    card: isDark ? '#1e1e1e' : '#f0f7ff'
  };

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: theme.fundo },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, paddingTop: 10, color: '#007bff' },
    label: { fontSize: 14, fontWeight: 'bold', marginTop: 15, color: theme.texto },
    input: { 
      borderWidth: 1, padding: 12, borderRadius: 10, marginTop: 5,
      backgroundColor: theme.inputFundo, borderColor: theme.inputBorder, color: theme.texto
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    
    // DATA E HORA SEPARADOS
    dateTimeGroup: { marginBottom: 10 },
    dateTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, gap: 5 },
    dateTimeBtn: { backgroundColor: theme.card, padding: 12, borderRadius: 10, width: '48%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    dateTimeText: { color: '#007bff', fontWeight: 'bold', fontSize: 13, marginLeft: 5 },

    // CATEGORIAS
    categoriaContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    catBadge: { padding: 10, borderRadius: 15, borderWidth: 1, borderColor: theme.inputBorder, marginRight: 8, marginBottom: 8 },
    catBadgeSelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
    catBadgeInner: { flexDirection: 'row', alignItems: 'center' },
    catText: { fontSize: 12, color: theme.texto, marginLeft: 5 },
    catTextSelected: { color: '#fff', fontWeight: 'bold' }, 

    mapContainer: { height: 220, marginTop: 10, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: theme.inputBorder },
    map: { flex: 1 },
    
    // BOTÕES DE AÇÃO
    buttonArea: { marginTop: 25, gap: 10 },
    button: { backgroundColor: '#007bff', padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonCancel: { backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#dc3545' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    buttonTextCancel: { color: '#dc3545', fontSize: 16, fontWeight: 'bold' },
  });

  return { ...styles, colors: theme };
};