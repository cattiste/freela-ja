// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage" // Adicionado o storage

// Configuração do Firebase usando variáveis de ambiente ou valores padrão
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAhk9Ne3BfN7lrsUzGIE0R1h9eZzegwp7I",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "freelaja-web-50254.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "freelaja-web-50254",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "freelaja-web-50254.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "485288996083",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:485288996083:web:4e85a5c6db227156f35b86"
}

// Validação básica
if (!firebaseConfig.apiKey) {
  console.error("⚠️ Firebase API key is missing!")
  throw new Error("Firebase configuration is incomplete")
}

// Inicializa o app Firebase
let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error)
  throw error
}

// Inicializa os serviços
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app) // Inclui suporte a uploads e imagens

// Log de debug no modo desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log("✅ Firebase inicializado com sucesso")
  console.log("📁 Projeto Firebase:", firebaseConfig.projectId)
}

// Exporta para uso global
export { app, auth, db, storage }
