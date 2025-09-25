// src/context/AuthContext.jsx
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

// ✅ Normaliza tipo de usuário para só "freela" ou "contratante"
const normalizeTipo = (t) => {
  if (!t) return ''
  const norm = String(t).trim().toLowerCase().replace(/\s+/g, '_')
  if (['freela', 'freelancer'].includes(norm)) return 'freela'
  if (['contratante', 'pessoa_fisica', 'estabelecimento', 'cliente', 'empresa'].includes(norm)) {
    return 'contratante'
  }
  return norm // fallback (se vier algo estranho, mantém mas não quebra)
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Garante persistência local (não bloqueia se falhar)
    setPersistence(auth, browserLocalPersistence).catch(() => {})

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUsuario(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', u.uid)
        const snap = await getDoc(ref)

        // Cria perfil mínimo se ainda não existir
        if (!snap.exists()) {
          const perfilMinimo = {
            uid: u.uid,
            email: u.email ?? '',
            tipo: 'contratante', // padrão se não definido
            criadoEm: serverTimestamp(),
            atualizadoEm: serverTimestamp(),
          }
          await setDoc(ref, perfilMinimo, { merge: true })
          setUsuario({ ...perfilMinimo })
          setCarregando(false)
          return
        }

        const perfil = snap.data()
        const tipoNorm = normalizeTipo(perfil?.tipo)

        setUsuario({
          uid: u.uid,
          email: u.email ?? '',
          ...perfil,
          tipo: tipoNorm,
        })
      } catch (e) {
        console.error('[Auth] erro ao carregar perfil:', e)
        setUsuario({ uid: u.uid, email: u.email ?? '', tipo: 'contratante' })
      } finally {
        setCarregando(false)
      }
    })

    return () => unsub()
  }, [])

  const value = useMemo(() => ({ usuario, carregando }), [usuario, carregando])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
