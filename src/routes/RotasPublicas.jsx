import React from 'react'
import { Route } from 'react-router-dom'

// Páginas públicas
import Home from '../pages/gerais/Home'
import Sobre from '../pages/gerais/Sobre'
import Cadastro from '../pages/gerais/Cadastro'
import Login from '../pages/gerais/Login'
import EsqueciSenha from '../pages/gerais/EsqueciSenha'
import Oportunidades from '../pages/gerais/Oportunidades'
import PerfilFreela from '../pages/PerfilFreela'
import PerfilEstabelecimento from '../pages/PerfilEstabelecimento'
import PublicarEvento from '../pages/gerais/PublicarEvento'

console.log('🔁 Render RotasPublicas')

export default function RotasPublicas() {
  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esquecisenha" element={<EsqueciSenha />} />
      <Route path="/oportunidades" element={<Oportunidades />} />
      <Route path="/perfilfreela/:uid" element={<PerfilFreela />} />
      <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento />} />
      <Route path="/publicarevento" element={<PublicarEvento />} />
    </>
  )
}
