import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
    if (usuario) {
      // Buscar dados adicionais no Firestore
      const ref = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(ref)
      const dataExtra = snap.exists() ? snap.data() : {}

      setUser({
        uid: usuario.uid,
        email: usuario.email,
        ...dataExtra
      })
    } else {
      setUser(null)
    }
  })

  return () => unsubscribe()
}, [])
