import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import PainelChef from './pages/PainelChef'
import Navbar from './components/Navbar'
import Contratar from './pages/Contratar'
import Perfil from './pages/Perfil'
import RotaProtegida from './components/RotaProtegida'
import PainelEstabelecimento from './pages/PainelEstabelecimento'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contratar" element={<Contratar />} />
        <Route path="/perfil/:id" element={<Perfil />} />
        
        {/* Painel do Chef protegido */}
        <Route
          path="/painel"
          element={
            <RotaProtegida>
              <PainelChef />
            </RotaProtegida>
          }
        />

        {/* Painel do Estabelecimento protegido */}
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
