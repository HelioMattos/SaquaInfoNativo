import { Platform, StyleSheet } from 'react-native';

export const getPerfilStyles = (isDark: boolean) => {
  const theme = {
    fundo: isDark ? '#121212' : '#F2F2F7',
    card: isDark ? '#1e1e1e' : '#fff',
    texto: isDark ? '#fff' : '#333',
    subtexto: isDark ? '#aaa' : '#666',
    border: isDark ? '#333' : '#F2F2F7',
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.fundo,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: Platform.OS === 'web' ? 100 : 40,
      alignItems: 'center',
    },
    header: {
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 40,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#007bff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.texto,
    },
    userEmail: {
      fontSize: 16,
      color: theme.subtexto,
      marginTop: 5,
    },
    section: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 30,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#007bff',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      width: '100%',
    },
    infoRowVisitante: {
      marginTop: 24,
      borderBottomWidth: 0,
      justifyContent: 'center',
    },
    infoText: {
      marginLeft: 15,
      fontSize: 16,
      color: theme.subtexto,
    },
    logoutButton: {
      flexDirection: 'row',
      backgroundColor: '#FF3B30',
      width: '100%',
      height: 55,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    logoutText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return { ...styles, colors: theme };
};
