// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Páginas
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
import EditarFreela from './pages/EditarFreela'
import EditarPerfilEstabelecimento from './pages/EditarPerfilEstabelecimento'
import VagasDisponiveis from './pages/VagasDisponiveis'
import EsqueciSenha from './pages/EsqueciSenha'

// Rotas protegidas
import RotaProtegidaFreela from './components/RotaProtegidaFreela'
import RotaProtegidaEstabelecimento from './components/RotaProtegidaEstabelecimento'

export default function App() {
  const usuarioLogado = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('usuarioLogado'))
    } catch {
      return null
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>

          {/* Páginas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/esquecisenha" element={<EsqueciSenha />} />

          {/* Cadastro e Perfil */}
          <Route path="/cadastrofreela" element={<CadastroFreela />} />
          <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
          <Route path="/perfil/:id" element={<Perfil />} />
          <Route path="/editarfreela/:id" element={<EditarFreela />} />
          <Route path="/editarperfilestabelecimento" element={<EditarPerfilEstabelecimento />} />

          {/* Painéis protegidos */}
          <Route
            path="/painelfreela"
            element={
              <RotaProtegidaFreela>
                <PainelFreela />
              </RotaProtegidaFreela>
            }
          />
          <Route
            path="/painel-estabelecimento"
            element={
              <RotaProtegidaEstabelecimento>
                <PainelEstabelecimento />
              </RotaProtegidaEstabelecimento>
            }
          />

          {/* Vagas protegidas */}
          <Route
            path="/vagas-disponiveis"
            element={
              <RotaProtegidaFreela>
                <VagasDisponiveis />
              </RotaProtegidaFreela>
            }
          />
          <Route
            path="/publicarvaga"
            element={
              <RotaProtegidaEstabelecimento>
                <PublicarVaga estabelecimento={usuarioLogado} />
              </RotaProtegidaEstabelecimento>
            }
          />

          {/* Currículos (aberta ao público) */}
          <Route path="/curriculos" element={<Curriculos />} />

          {/* Página de testes ou futuras rotas */}
          <Route path="/teste-criar-vaga" element={<TesteCriarVaga />} />

        </Routes>
      </div>
    </Router>
  )
}
