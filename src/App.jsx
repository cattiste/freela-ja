// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import PainelFreela from './pages/PainelFreela'
import PainelEstabelecimento from './pages/PainelEstabelecimento'
import Contratar from './pages/Contratar'
import Perfil from './pages/Perfil'
import RotaProtegida from './components/RotaProtegida'
import CadastroFreela from './pages/CadastroFreela'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'

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
        <Route path="/contratar" element={<Contratar />} />
        <Route path="/cadastrofreela" element={<CadastroFreela />} />
        <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
        <Route path="/perfil/:id" element={<Perfil />} />
      </Routes>
    </Router>
  )
}

export default App
