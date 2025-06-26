import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import PainelFreela from './pages/PainelFreela'
import PainelEstabelecimento from './pages/PainelEstabelecimento'
import Curriculos from './pages/Curriculos'
import Perfil from './pages/Perfil'
import CadastroFreela from './pages/CadastroFreela'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'
import PainelVagas from './pages/PainelVagas'
import PublicarVaga from './pages/PublicarVaga'
import TesteCriarVaga from './pages/TesteCriarVaga'

import RotaProtegidaFreela from './components/RotaProtegidaFreela'
import RotaProtegidaEstabelecimento from './components/RotaProtegidaEstabelecimento'

function App() {
  return (
    <Router>
      <Routes>

        {/* Páginas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />

        {/* Cadastro e Perfil */}
        <Route path="/cadastrofreela" element={<CadastroFreela />} />
        <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
        <Route path="/perfil/:id" element={<Perfil />} />

        {/* Painéis protegidos */}
        <Route path="/painelfreela" element={<RotaProtegidaFreela><PainelFreela /></RotaProtegidaFreela>} />
        <Route path="/painel-estabelecimento" element={<RotaProtegidaEstabelecimento><PainelEstabelecimento /></RotaProtegidaEstabelecimento>} />

        {/* Vagas */}
        <Route path="/vagas" element={<PainelVagas />} />
        <Route path="/publicarvaga" element={<PublicarVaga />} />
        <Route path="/teste-criar-vaga" element={<TesteCriarVaga />} />

        {/* Currículos */}
        <Route path="/curriculos" element={<Curriculos />} />
        
      </Routes>
    </Router>
  )
}

export default App
