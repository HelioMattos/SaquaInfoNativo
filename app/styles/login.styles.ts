import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  subtitulo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkRegistro: {
    marginTop: 25,
    alignItems: 'center',
  },
  txtLink: {
    color: '#666',
    fontSize: 14,
  },
  txtLinkDestaque: {
    color: '#007AFF',
    fontWeight: 'bold',
  },

  areaSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  inputSenha: {
    flex: 1,
    padding: 15,
  },
  botaoOlhinho: {
    padding: 10,
    marginRight: 5,
  },

  linkEsqueciSenha: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -5,
  },
  
  txtEsqueciSenha: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '500',
  },
});