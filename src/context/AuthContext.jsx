import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { resolveRole } from '@/utils/role'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUsuario(null)
          localStorage.removeItem('usuarioLogado')
          setCarregando(false)
          return
        }

        // força renovar token (evita permission_denied no RTDB)
        try { await fbUser.getIdToken(true) } catch {}

        // busca perfil no Firestore
        const ref = doc(db, 'usuarios', fbUser.uid)
        const snap = await getDoc(ref)

        const base = { uid: fbUser.uid, email: fbUser.email || '' }
        const perfil = snap.exists() ? { ...base, ...snap.data() } : base

        // 🔑 papel normalizado (novo/legado) — nunca lança erro
        const role = resolveRole(perfil)
        const usuarioFmt = { ...perfil, role }

        setUsuario(usuarioFmt)
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioFmt))
      } catch (erro) {
        console.error('Erro ao buscar dados do usuário:', erro)
        // fallback seguro
        const fbUser = auth.currentUser
        const base = fbUser ? { uid: fbUser.uid, email: fbUser.email || '' } : null
        const role = resolveRole(base || {})
        const fallback = base ? { ...base, role } : null
        setUsuario(fallback)
        if (fallback) localStorage.setItem('usuarioLogado', JSON.stringify(fallback))
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Atualiza dados do perfil sem mexer no Auth
  const atualizarUsuario = async () => {
    const fbUser = auth.currentUser
    if (!fbUser) return
    const snap = await getDoc(doc(db, 'usuarios', fbUser.uid))
    const base = { uid: fbUser.uid, email: fbUser.email || '' }
    const perfil = snap.exists() ? { ...base, ...snap.data() } : base
    const role = resolveRole(perfil)
    const usuarioFmt = { ...perfil, role }
    setUsuario(usuarioFmt)
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioFmt))
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
