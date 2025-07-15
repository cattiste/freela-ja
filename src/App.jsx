// src/App.jsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

// Páginas
import Home from '@/pages/Home'
import Sobre from '@/pages/Sobre'
import Cadastro from '@/pages/Cadastro'
import Login from '@/pages/Login'
import EsqueciSenha from '@/pages/EsqueciSenha'
import Oportunidades from '@/pages/Oportunidades'
import PerfilFreela from '@/pages/PerfilFreela'
import PerfilEstabelecimento from '@/pages/PerfilEstabelecimento'
import PublicarEvento from '@/pages/PublicarEvento'
import PainelFreela from '@/pages/PainelFreela'
import PainelEstabelecimento from '@/pages/PainelEstabelecimento'

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esquecisenha" element={<EsqueciSenha />} />
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route path="/perfilfreela/:uid" element={<PerfilFreela />} />
        <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento />} />
        <Route path="/publicarevento" element={<PublicarEvento />} />
        <Route path="/painelfreela" element={<PainelFreela freela={usuario} />} />
        <Route path="/painelestabelecimento" element={<PainelEstabelecimento usuario={usuario} />} />
      </Routes>
    </BrowserRouter>
  )
}
