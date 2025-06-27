import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Navigate } from 'react-router-dom'
import { auth, db } from '@/firebase'

export default function RotaProtegidaFreela({ children }) {
  const [carregando, setCarregando] = useState(true)
  const [permitido, setPermitido] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setPermitido(false)
        setCarregando(false)
        return
      }

      try {
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists() && docSnap.data().tipo === 'freela') {
          setPermitido(true)
        } else {
          setPermitido(false)
        }
      } catch (err) {
        console.error('Erro ao verificar tipo de usuário:', err)
        setPermitido(false)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600">
        <div className="text-center">
          <p className="text-xl font-semibold">Verificando acesso...</p>
          <p className="text-sm text-gray-500">Por favor, aguarde.</p>
        </div>
      </div>
    )
  }

  return permitido ? children : <Navigate to="/login" />
}
