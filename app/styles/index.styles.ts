import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: '#f4f4f4' 
  },

  titulo: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#007AFF', 
    textAlign: 'center', 
    marginBottom: 20 
  },

  bannerAdmin: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 20, 
    elevation: 3 
  },

  botaoAdd: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center'
   },

  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    marginBottom: 15, 
    overflow: 'hidden', 
    elevation: 3 
  },

  imagemCard: { 
    width: '100%', 
    height: 150, 
    backgroundColor: '#eee' 
  },

  cardConteudo: { 
    padding: 15 
  },

  cardTitulo: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  cardInfo: { 
    color: '#666', 
    marginTop: 5 
  },

  areaBotoes: { 
    flexDirection: 'row', 
    marginTop: 10, 
    gap: 10 
  },

  btnEditar: { 
    backgroundColor: '#FFC107', 
    padding: 8, 
    borderRadius: 5, 
    flex: 1, 
    alignItems: 'center' 
  },

  btnExcluir: { 
    backgroundColor: '#DC3545', 
    padding: 8, 
    borderRadius: 5, 
    flex: 1, 
    alignItems: 'center' 
  },

  txtBtn: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },

  badgeCategoria: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },

  txtCategoria: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  btnMapa: {
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  txtBtnMapa: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  btnFavorito: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 8,
    borderRadius: 20,
    elevation: 5,
  },

  txtFavorito: {
    fontSize: 20,
  },

  containerLogin: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  
  emojiLogin: {
    fontSize: 60,
    marginBottom: 20,
  },

  txtBoasVindas: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    fontWeight: '500',
  },

});