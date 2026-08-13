import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCkwKFsktwQjWBlOISsmmXum3wJ-jT3JYo",
  authDomain: "saquainfo-99128.firebaseapp.com",
  projectId: "saquainfo-99128",
  storageBucket: "saquainfo-99128.firebasestorage.app",
  messagingSenderId: "50771678769",
  appId: "1:50771678769:web:82ce83d38282c7cba06710"
};

// Evita erro de inicializar o app do Firebase mais de uma vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Proteção crucial para evitar tela vermelha (Blob Error) no Android/iOS
if (Platform.OS !== 'web') {
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
}

// Usando const com condicional direta para o VS Code reconhecer a exportação
const auth = Platform.OS === 'web'
  ? getAuth(app)
  : require('firebase/auth').initializeAuth(app, {
      persistence: require('firebase/auth').getReactNativePersistence(AsyncStorage)
    });

const db = getFirestore(app);

export { app, auth, db };
