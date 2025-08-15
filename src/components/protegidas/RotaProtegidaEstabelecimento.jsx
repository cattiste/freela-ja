import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Navigate } from 'react-router-dom'
import { auth, db } from '@/firebase'

export default function RotaProtegidaContratante({ children }) {
  const [carregando, setCarregando] = useState(true)
  const [permitido, setPermitido] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setPermitido(false)
        setCarregando(false)
        return
      }

      const docRef = doc(db, 'usuarios', usuario.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists() && docSnap.data().tipo === 'contratante') {
        setPermitido(true)
      } else {
        setPermitido(false)
      }

      setCarregando(false)
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
