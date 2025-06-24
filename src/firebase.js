import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAhk9Ne3BfN7lrsUzGIE0R1h9eZzegwp7I",
  authDomain: "freelaja-web-50254.firebaseapp.com",
  projectId: "freelaja-web-50254",
  storageBucket: "freelaja-web-50254.appspot.com",
  messagingSenderId: "485288996083",
  appId: "1:485288996083:web:4e85a5c6db227156f35b86"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
