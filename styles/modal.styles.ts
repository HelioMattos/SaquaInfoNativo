import { StyleSheet } from 'react-native';

export const getModalStyles = (isDark: boolean) => {
  const theme = {
    fundo: isDark ? '#121212' : '#fff',
    texto: isDark ? '#fff' : '#333',
    subtexto: isDark ? '#aaa' : '#666',
    card: isDark ? '#1e1e1e' : '#f8f9fa',
    border: isDark ? '#333' : '#eee',
    icon: isDark ? '#fff' : '#333'
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.fundo },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 20, 
      paddingBottom: 15, 
      paddingTop: 15, 
      borderBottomWidth: 1, 
      borderBottomColor: theme.border 
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.texto },
    actionButtons: { flexDirection: 'row' },
    iconBtn: { marginLeft: 15 },
    content: { padding: 20 },
    rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap' },
    tituloText: { fontSize: 26, fontWeight: 'bold', color: theme.texto, marginRight: 10 },
    tag: { backgroundColor: '#e1f0ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    tagTexto: { color: '#007bff', fontWeight: 'bold', fontSize: 12 },
    
    // LINHAS DE INFO (DATA/LOCAL)
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    infoTextGroup: { marginLeft: 12 },
    infoLabel: { fontSize: 12, color: theme.subtexto, textTransform: 'uppercase', fontWeight: 'bold' },
    infoValue: { fontSize: 16, color: theme.texto, fontWeight: '500' },
    
    descricaoContainer: { marginTop: 10 },
    labelVerde: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 8 },
    descricaoText: { fontSize: 16, color: theme.texto, lineHeight: 24 },

    botaoWhatsApp: {
      flexDirection: 'row',
      backgroundColor: '#25D366',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    textoWhatsApp: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    carouselContainer: { marginBottom: 20 },
    carouselImage: { width: '100%', height: 200, borderRadius: 16 },
    carouselDots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
    carouselDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: isDark ? '#444' : '#ccc' },
    carouselDotActive: { backgroundColor: '#007bff' },
    
    mapWrapper: { height: 220, marginTop: 25, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
    mapWrapperRota: { height: 380 },
    map: { flex: 1, width: '100%', height: '100%' }
  });

  return { ...styles, colors: theme };
};