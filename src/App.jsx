// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import PainelChef from './pages/PainelChef'
import Navbar from './components/Navbar'
import Contratar from './pages/Contratar'
import ContratarChef from './pages/ContratarChef'
import PerfilChef from './pages/PerfilChef'
import PerfilProfissional from './pages/PerfilProfissional'

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
        <Route path="/contratar" element={<ContratarChef />} />
        <Route path="/perfil/:nome" element={<PerfilChef />} />
        <Route path="/perfil" element={<PerfilProfissional />} />

      </Routes>
    </Router>
  )
}

export default App
