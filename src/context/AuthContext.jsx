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

          const dados = docSnap.exists()
            ? { uid: usuario.uid, ...docSnap.data() }
            : { uid: usuario.uid, email: usuario.email }

          setUsuario(dados)
          localStorage.setItem('usuarioLogado', JSON.stringify(dados)) // ✅ salva no localStorage

        } catch (erro) {
          console.error('Erro ao buscar dados do usuário:', erro)
          const fallback = { uid: usuario.uid, email: usuario.email }
          setUsuario(fallback)
          localStorage.setItem('usuarioLogado', JSON.stringify(fallback)) // ✅ fallback
        }
      } else {
        setUsuario(null)
        localStorage.removeItem('usuarioLogado') // ✅ remove ao deslogar
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  const atualizarUsuario = async () => {
    const usuario = auth.currentUser
    if (usuario) {
      const docSnap = await getDoc(doc(db, 'usuarios', usuario.uid))
      if (docSnap.exists()) {
        const dados = { uid: usuario.uid, ...docSnap.data() }
        setUsuario(dados)
        localStorage.setItem('usuarioLogado', JSON.stringify(dados))
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
