import React from 'react'
import { Route } from 'react-router-dom'

// Páginas públicas
import Home from '../pages/gerais/Home.jsx'
import Sobre from '../pages/gerais/Sobre.jsx'
import Cadastro from '../pages/gerais/Cadastro.jsx'
import Login from '../pages/gerais/Login.jsx'
import EsqueciSenha from '../pages/gerais/EsqueciSenha.jsx'
import Oportunidades from '../pages/gerais/Oportunidades.jsx'
import PerfilFreela from '../pages/freelas/PerfilFreela.jsx'
import PerfilEstabelecimento from '../pages/estabelecimentos/PerfilEstabelecimento.jsx'

const RotasPublicas = () => (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/sobre" element={<Sobre />} />
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/login" element={<Login />} />
    <Route path="/esquecisenha" element={<EsqueciSenha />} />
    <Route path="/oportunidades" element={<Oportunidades />} />
    <Route path="/perfilfreela/:uid" element={<PerfilFreela />} />
    <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento />} />
  </>
)

export default RotasPublicas
