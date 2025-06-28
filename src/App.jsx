import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import PainelFreela from './pages/PainelFreela'
import PainelEstabelecimento from './pages/PainelEstabelecimento'
import Perfil from './pages/PerfilFreela'
import CadastroFreela from './pages/CadastroFreela'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'
import PainelVagas from './pages/PainelVagas'
import PublicarVaga from './pages/PublicarVaga'
import EditarFreela from './pages/EditarFreela'
import EsqueciSenha from './pages/EsqueciSenha'
import EditarPerfilEstabelecimento from './pages/EditarPerfilEstabelecimento'
import VagasDisponiveis from './pages/VagasDisponiveis'

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
          <Route path="/curriculos" element={<Curriculos />} />

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
                <PainelEstabelecimento usuario={usuarioLogado} />
              </RotaProtegidaEstabelecimento>
            }
          />

          {/* Vagas */}
          <Route
            path="/vagas"
            element={
              <RotaProtegidaEstabelecimento>
                <PainelVagas />
              </RotaProtegidaEstabelecimento>
            }
          />
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
        </Routes>
      </div>
    </Router>
  )
}
