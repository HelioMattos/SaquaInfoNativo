import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },

  tituloPagina: {
     fontSize: 22, 
     fontWeight: 'bold', 
     textAlign: 'center', 
     marginVertical: 20,
     color: '#007AFF' 
  },
 
  areaFoto: { 
    marginBottom: 20, 
    alignItems: 'center' 
  },

  preview: { 
    width: '100%', 
    height: 180, 
    borderRadius: 10, 
    backgroundColor: '#eee', 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden' 
  },

  
  label: { 
    fontWeight: 'bold', 
    marginTop: 15, 
    color: '#333' 
  },
  
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    marginTop: 5, 
    backgroundColor: '#fafafa' 
  },
  
  switch: { 
    padding: 12, 
    backgroundColor: '#e9ecef', 
    borderRadius: 8, 
    marginVertical: 15, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  
  inputData: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  
  btnSalvar: { 
    backgroundColor: '#28a745', 
    padding: 18, 
    borderRadius: 10, 
    marginTop: 35, 
    alignItems: 'center', 
    marginBottom: 50, 
    elevation: 2 
  },

  containerCategorias: {
     flexDirection: 'row', 
     flexWrap: 'wrap', 
     gap: 10, 
     marginTop: 10 
  },

  chip: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#007AFF', 
    backgroundColor: '#fff' 
  },

  chipSelecionado: { 
    backgroundColor: '#007AFF' 
  },

  txtChip: {
     color: '#007AFF', 
     fontSize: 13, 
     fontWeight: 'bold' 
  },

  txtChipSelecionado: {
     color: '#fff' 
  },

  btnGps: { 
    flexDirection: 'row', 
    backgroundColor: '#6c757d', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  txtGps: { 
    color: '#fff', 
    fontWeight: 'bold', 
    marginLeft: 10 
  },

})
;