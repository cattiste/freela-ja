// 📁 src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        try {
          await usuario.getIdToken(true) // força renovação
          const docRef = doc(db, 'usuarios', usuario.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setUsuario({ uid: usuario.uid, ...docSnap.data() })
          } else {
            setUsuario({ uid: usuario.uid, email: usuario.email })
          }
        } catch (erro) {
          console.error('Erro ao buscar dados do usuário:', erro)
          setUsuario({ uid: usuario.uid, email: usuario.email })
        }
      } else {
        setUsuario(null)
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  const atualizarUsuario = async () => {
    const user = auth.currentUser
    if (user) {
      const docSnap = await getDoc(doc(db, 'usuarios', user.uid))
      if (docSnap.exists()) {
        setUsuario({ uid: user.uid, ...docSnap.data() })
      }
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
