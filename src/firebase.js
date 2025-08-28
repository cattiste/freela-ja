// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getDatabase } from "firebase/database"
import { getFunctions } from "firebase/functions" // ✅ Importa getFunctions

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: 'https://freelaja-web-50254-default-rtdb.firebaseio.com/'
}

// ✅ Verificação de configuração
if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  console.log("🌐 databaseURL:", firebaseConfig.databaseURL)
  console.error("Firebase API key or databaseURL is missing!")
  throw new Error("Firebase configuration is incomplete")
}

// ✅ Inicialização do app
const app = initializeApp(firebaseConfig)

// ✅ Instâncias dos serviços
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const rtdb = getDatabase(app)
const functions = getFunctions(app, 'southamerica-east1') // ✅ Corrigido: com app e região

// ✅ Log de debug
if (import.meta.env.MODE === 'development') {
  console.log("✅ Firebase initialized successfully")
  console.log("🔎 Project ID:", firebaseConfig.projectId)
}

// ✅ Exporta tudo
export { app, auth, db, storage, rtdb, functions }



// Projeto original FreelaJá - Código registrado e rastreável
// Assinatura interna: 𝙁𝙅-𝟮𝟬𝟮𝟱-𝘽𝘾-𝘾𝙃𝘼𝙏𝙂𝙋𝙏
