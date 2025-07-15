// 📄 src/routes/RotasPublicas.jsx
import React from 'react'
import { Route } from 'react-router-dom'

import Home from '@/pages/gerais/Home'
import Sobre from '@/pages/gerais/Sobre'
import Cadastro from '@/pages/gerais/Cadastro'
import Login from '@/pages/gerais/Login'
import EsqueciSenha from '@/pages/gerais/EsqueciSenha'
import Oportunidades from '@/pages/gerais/Oportunidades'
import PublicarEvento from '@/pages/gerais/PublicarEvento'

export function RotasPublicas() {
  return (
    <>
      <Route path="/home" element={<Home />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esquecisenha" element={<EsqueciSenha />} />
      <Route path="/oportunidades" element={<Oportunidades />} />
      <Route path="/publicarevento" element={<PublicarEvento />} />
    </>
  )
}
