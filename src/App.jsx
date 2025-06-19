import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import PainelChef from './pages/PainelChef'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/painel" element={<PainelChef />} />
        <>
  <Navbar />
  <Routes>
    {/* suas rotas */}
  </Routes>
</>
      </Routes>
    </Router>
  )
}

export default App
