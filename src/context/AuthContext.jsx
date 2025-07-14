// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Criar o contexto
const AuthContext = createContext()

// Hook para acessar o contexto
export function useAuth() {
  return useContext(AuthContext)
}

// Componente provedor
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const ref = doc(db, 'usuarios', user.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            setUsuario({ uid: user.uid, ...snap.data() })
          } else {
            setUsuario({ uid: user.uid, email: user.email })
          }
        } else {
          setUsuario(null)
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err)
        setUsuario(null)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const value = { usuario, setUsuario }

  return (
    <AuthContext.Provider value={value}>
      {!carregando ? children : (
        <div className="text-center mt-20 text-orange-600 font-bold">🔄 Carregando...</div>
      )}
    </AuthContext.Provider>
  )
}
