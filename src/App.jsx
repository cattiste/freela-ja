import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Páginas públicas
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import EsqueciSenha from './pages/EsqueciSenha'
import Oportunidades from './pages/Oportunidades'

// Cadastro e Perfil
import CadastroFreela from './pages/CadastroFreela'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'
import EditarFreela from './pages/EditarFreela'
import EditarPerfilEstabelecimento from './pages/EditarPerfilEstabelecimento'
import PerfilFreela from './pages/PerfilFreela'

// Painéis protegidos
import PainelFreela from './pages/PainelFreela'
import PainelEstabelecimento from './pages/PainelEstabelecimento'

// Vagas
import PublicarVaga from './components/PublicarVaga'
import VagasDisponiveis from './pages/VagasDisponiveis'

// Eventos
import PublicarEvento from './pages/PublicarEvento'
import EventosDisponiveis from './pages/EventosDisponiveis'

// Rotas protegidas
import RotaProtegidaFreela from './components/RotaProtegidaFreela'
import RotaProtegidaEstabelecimento from './components/RotaProtegidaEstabelecimento'

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = React.useState(null)

  React.useEffect(() => {
    const dados = localStorage.getItem('usuarioLogado')
    if (dados) {
      try {
        setUsuarioLogado(JSON.parse(dados))
      } catch {
        setUsuarioLogado(null)
      }
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
          <Route path="/oportunidades" element={<Oportunidades />} />

          {/* Cadastro e Perfil */}
          <Route path="/cadastrofreela" element={<CadastroFreela />} />
          <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
          <Route path="/perfilfreela/:id" element={<PerfilFreela />} />
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
            path="/vagasdisponiveis"
            element={
              <RotaProtegidaFreela>
                <VagasDisponiveis freela={usuarioLogado} />
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

          {/* Eventos protegidos */}
          <Route
            path="/eventosdisponiveis"
            element={
              <RotaProtegidaFreela>
                <EventosDisponiveis />
              </RotaProtegidaFreela>
            }
          />
          <Route
            path="/publicarevento"
            element={
              <RotaProtegidaFreela>
                <PublicarEvento />
              </RotaProtegidaFreela>
            }
          />

                
      </div>
    </Router>
  )
}
