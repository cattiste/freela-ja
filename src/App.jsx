// 📄 src/App.jsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import RotasApp from './routes/RotasApp'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setUsuario({ uid: user.uid, ...docSnap.data() })
        } else {
          setUsuario({ uid: user.uid, email: user.email })
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
}
