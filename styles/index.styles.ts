import { Platform, StyleSheet } from 'react-native';

export const getIndexStyles = (isDark: boolean) => {
  const theme = {
    fundo: isDark ? '#121212' : '#f8f9fa',
    card: isDark ? '#1e1e1e' : '#fff',
    texto: isDark ? '#fff' : '#333',
    subtexto: isDark ? '#aaa' : '#666',
    header: isDark ? '#1e1e1e' : '#fff',
    border: isDark ? '#333' : '#eee'
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: theme.fundo 
    },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 20, 
      paddingTop: Platform.OS === 'ios' ? 60 : 45, 
      paddingBottom: 15, 
      backgroundColor: theme.header,
      borderBottomWidth: 1, 
      borderBottomColor: theme.border 
    },
    tituloHeader: { 
      fontSize: 22, 
      fontWeight: 'bold' 
    },
    botaoAdd: { 
      backgroundColor: '#007bff', 
      width: 40, 
      height: 40, 
      borderRadius: 20, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    card: {
      padding: 12,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 15,
      borderWidth: 1,
      backgroundColor: theme.card,
      borderColor: theme.border,
    },
    cardImagem: {
      width: 90,
      height: 90,
      borderRadius: 8,
      backgroundColor: isDark ? '#333' : '#f0f0f0',
    },
    cardInfo: {
      flex: 1,
      marginLeft: 15,
      justifyContent: 'center',
    },
    cardTitulo: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.texto,
    },
    cardMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    cardData: {
      color: '#28a745',
      fontSize: 12,
      fontWeight: 'bold',
      flexShrink: 1,
    },
    cardCategoria: {
      backgroundColor: isDark ? '#1a3a5c' : '#e1f0ff',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    cardCategoriaTexto: {
      color: '#007bff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    cardLocal: {
      color: theme.subtexto,
      fontSize: 13,
      marginTop: 4,
    },
    cardSeta: {
      alignSelf: 'center',
      marginTop: 30,
    },
  });

  // Retorno unificado para evitar erro de tipo no TypeScript
  return { ...styles, colors: theme };
};