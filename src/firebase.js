<<<<<<< HEAD
// src/firebase.js (ou .ts, dependendo do seu projeto)
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Configuração do Firebase (não exponha chaves sensíveis em produção)
const firebaseConfig = {
  apiKey: "AIzaSyAhk9Ne3BfN7lrsUzGIE0R1h9eZzegwp7I",
  authDomain: "freelaja-web-50254.firebaseapp.com",
  projectId: "freelaja-web-50254",
  storageBucket: "freelaja-web-50254.appspot.com",
  messagingSenderId: "485288996083",
  appId: "1:485288996083:web:4e85a5c6db227156f35b86"
}

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig)

// Inicializa os serviços que vai usar
const auth = getAuth(app)
const db = getFirestore(app)

// Exporta para usar nas outras partes do app
export { app, auth, db }
=======
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Adicionado storage

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAhk9Ne3BfN7lrsUzGIE0R1h9eZzegwp7I",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "freelaja-web-50254.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "freelaja-web-50254",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "freelaja-web-50254.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "485288996083",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:485288996083:web:4e85a5c6db227156f35b86"
};

// Verificação básica das configurações
if (!firebaseConfig.apiKey) {
  console.error("Firebase API key is missing!");
  throw new Error("Firebase configuration is incomplete");
}

// Inicializa o app Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

// Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializa o storage

// Verificação de conexão (opcional para desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  console.log("Firebase initialized successfully");
  console.log("Project ID:", firebaseConfig.projectId);
}

// Exporta para usar nas outras partes do app
export { app, auth, db, storage };
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
