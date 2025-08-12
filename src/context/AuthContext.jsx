// src/context/AuthContext.jsx
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

const normalizeTipo = (t) => {
  if (!t) return ''
  let s = String(t).trim().toLowerCase().replace(/\s+/g, '_')
  if (s === 'pessoafisica') s = 'pessoa_fisica'
  return s
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // garante persistência local (não bloqueia fluxo se falhar)
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

        // cria perfil mínimo se ainda não existir (evita tipo indefinido)
        if (!snap.exists()) {
          const perfilMinimo = {
            uid: u.uid,
            email: u.email ?? '',
            tipo: '', // define depois no cadastro
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
          tipo: tipoNorm, // sempre normalizado
        })
      } catch (e) {
        console.error('[Auth] erro ao carregar perfil:', e)
        // fallback: usuário básico logado
        setUsuario({ uid: u.uid, email: u.email ?? '', tipo: '' })
      } finally {
        setCarregando(false)
      }
    })

    return () => unsub()
  }, [])

  const value = useMemo(() => ({ usuario, carregando }), [usuario, carregando])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
