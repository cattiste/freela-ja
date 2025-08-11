// src/context/AuthContext.jsx
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)           // perfil + auth
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUsuario(null)
        setCarregando(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'usuarios', u.uid))
        const perfil = snap.exists() ? snap.data() : {}
        setUsuario({ uid: u.uid, email: u.email, ...perfil })
      } catch (e) {
        console.error('[Auth] erro ao carregar perfil:', e)
        setUsuario({ uid: u.uid, email: u.email }) // fallback
      } finally {
        setCarregando(false)
      }
    })
    return () => unsub()
  }, [])

  return <Ctx.Provider value={{ usuario, carregando }}>{children}</Ctx.Provider>
}
