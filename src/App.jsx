// src/App.jsx
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
import RotaProtegida from './components/RotaProtegida'
import CadastroFreela from './pages/CadastroFreela'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'
import PainelVagas from './pages/PainelVagas'
import PublicarVaga from './pages/PublicarVaga'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/painelfreela" element={<PainelFreela />} />
        <Route path="/painel-estabelecimento" element={<RotaProtegida><PainelEstabelecimento /></RotaProtegida>} />
        <Route path="/vagas" element={<Curriculos />} />
        <Route path="/cadastrofreela" element={<CadastroFreela />} />
        <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
        <Route path="/perfil/:id" element={<Perfil />} />
        <Route path="/vagas" element={<PainelVagas />} />
        <Route path="/publicarvaga" element={<PublicarVaga />} /> 
      </Routes>
    </Router>
  )
}

export default App
