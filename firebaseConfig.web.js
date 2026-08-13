// firebaseConfig.web.js (EXCLUSIVO PARA VERCEL / PWA)
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkwKFsktwQjWBlOISsmmXum3wJ-jT3JYo",
  authDomain: "saquainfo-99128.firebaseapp.com",
  projectId: "saquainfo-99128",
  storageBucket: "saquainfo-99128.firebasestorage.app",
  messagingSenderId: "50771678769",
  appId: "1:50771678769:web:82ce83d38282c7cba06710"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Na web, o próprio navegador cuida do login automaticamente
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
