// src/App.jsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

// Páginas
import Home from '@/pages/gerais/Home'
import Sobre from '@/pages/gerais/Sobre'
import Cadastro from '@/freela/CadastroFreela'
import Login from '@/pages/gerais/Login'
import EsqueciSenha from '@/pages/gerais/EsqueciSenha'
import Oportunidades from '@/pages/gerais/Oportunidades'
import PerfilFreela from './freela/PerfilFreela'
import PerfilEstabelecimento from '@/pages/PerfilEstabelecimento'
import PublicarEvento from '@/pages/gerais/PublicarEvento'
import PainelEstabelecimento from '@/pages/PainelEstabelecimento'
import PainelFreela from './freela/PainelFreela'

// Se quiser usar rotas agrupadas no futuro:
// import { RotasPublicas } from './routes/RotasPublicas'

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
        <Route path="/home" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cadastrofreela" element={<CadastroFreela />} />
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
