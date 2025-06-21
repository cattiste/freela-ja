// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import PainelChef from './pages/PainelChef'
import PainelEstabelecimento from './pages/PainelEstabelecimento'
import Navbar from './components/Navbar'
import Contratar from './pages/Contratar'
import Perfil from './pages/Perfil'
import RotaProtegida from './components/RotaProtegida' // (caso exista essa proteção)
import CadastroFreela from './pages/CadastroFreela'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/painel" element={<PainelChef />} />
        <Route path="/contratar" element={<Contratar />} />
        <Route path="/cadastro-freela" element={<CadastroFreela />} />
        <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />

        {/* Perfil unificado */}
        <Route path="/perfil/:id" element={<Perfil />} />

        {/* Painel protegido do estabelecimento */}
        <Route
          path="/painel-estabelecimento"
          element={
            <RotaProtegida>
              <PainelEstabelecimento />
            </RotaProtegida>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
