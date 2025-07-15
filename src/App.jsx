// 📄 src/App.jsx
import React, { useEffect, useState } from 'react'
import RotasApp from './routes/RotasApp'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        const docRef = doc(db, 'usuarios', usuario.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setUsuario({ uid: usuario.uid, ...docSnap.data() })
        } else {
          setUsuario({ uid: usuario.uid, email: usuario.email })
        }
      } else {
        setUsuario(null)
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  if (carregando) {
    return <div className="text-center mt-20 text-orange-600 font-bold">🔄 Carregando...</div>
  }

  return (
    <RotasApp usuario={usuario} />
  )
}
