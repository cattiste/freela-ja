// src/App.jsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

// Páginas gerais
import Home from '@/pages/gerais/Home'
import Sobre from '@/pages/gerais/Sobre'
import Login from '@/pages/gerais/Login'
import EsqueciSenha from '@/pages/gerais/EsqueciSenha'
import Oportunidades from '@/pages/gerais/Oportunidades'
import PublicarEvento from '@/pages/gerais/PublicarEvento'
import Avaliacao from '@/pages/gerais/Avaliacao'

// Páginas de freela
import CadastroFreela from '@/pages/freela/CadastroFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import PainelFreela from '@/pages/freela/PainelFreela'

// Páginas de estabelecimento
import PerfilEstabelecimento from '@/pages/estabelecimento/PerfilEstabelecimento'
import PainelEstabelecimento from '@/pages/estabelecimento/PainelEstabelecimento'
import CadastroEstabelecimento from '@/pages/estabelecimento/CadastroEstabelecimento'
import EditarPerfilEstabelecimento from '@/pages/estabelecimento/EditarPerfilEstabelecimento'
import PublicarVaga from '@/pages/estabelecimento/PublicarVaga'

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
    return unsubscribe
  }, [])

  if (carregando) {
    return (
      <div className="text-center mt-20 text-orange-600 font-bold">
        🔄 Carregando...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Gerais */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esquecisenha" element={<EsqueciSenha />} />
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route path="/publicarevento" element={<PublicarEvento />} />

        {/* Avaliação compartilhada */}
        <Route path="/avaliar/:tipo/:id" element={<Avaliacao />} />

        {/* Freela */}
        <Route path="/cadastrofreela" element={<CadastroFreela />} />
        <Route path="/perfilfreela/:uid" element={<PerfilFreela />} />
        <Route
          path="/painelfreela/:rota?"
          element={<PainelFreela freela={usuario} />}
        />

        {/* Estabelecimento */}
        <Route path="/cadastroestabelecimento" element={<CadastroEstabelecimento />} />
        <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento />} />
        <Route path="/painelestabelecimento/:rota?" element={<PainelEstabelecimento usuario={usuario} />} />
        <Route path="/editarperfilestabelecimento/:uid" element={<EditarPerfilEstabelecimento />} />
        <Route path="/publicarvaga" element={<PublicarVaga />} />
      </Routes>
    </BrowserRouter>
  )
}
