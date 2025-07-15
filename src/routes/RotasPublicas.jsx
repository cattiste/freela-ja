import React from 'react'
import { Route } from 'react-router-dom'

// Páginas públicas
import Home from '../pages/Home'
import Sobre from '../pages/Sobre'
import Cadastro from '../pages/Cadastro'
import Login from '../pages/Login'
import EsqueciSenha from '../pages/EsqueciSenha'
import Oportunidades from '../pages/Oportunidades'
import PerfilFreela from '../pages/PerfilFreela'
import PerfilEstabelecimento from '../pages/PerfilEstabelecimento'
import PublicarEvento from '../pages/PublicarEvento'

export default function RotasPublicas({ usuario }) {
  console.log('🔁 Render RotasPublicas', usuario)

  return (
    <>
      <Route path="/home" element={<Home />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esquecisenha" element={<EsqueciSenha />} />
      <Route path="/oportunidades" element={<Oportunidades usuario={usuario} />} />
      <Route path="/perfilfreela/:uid" element={<PerfilFreela usuario={usuario} />} />
      <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento usuario={usuario} />} />
      <Route path="/publicarevento" element={<PublicarEvento usuario={usuario} />} />
    </>
  )
}
