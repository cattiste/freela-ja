// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Contexto de autenticação
import { AuthProvider } from '@/context/AuthContext'
import PagamentoChamada from '@/pages/estabelecimento/PagamentoChamada'

// Páginas gerais
import Home from '@/pages/gerais/Home'
import Sobre from '@/pages/gerais/Sobre'
import Login from '@/pages/gerais/Login'
import EsqueciSenha from '@/pages/gerais/EsqueciSenha'
import Oportunidades from '@/pages/gerais/Oportunidades'
import Avaliacao from '@/pages/gerais/Avaliacao'
import PagamentoEvento from '@/pages/gerais/PagamentoEvento'
import EventoConfirmado from '@/pages/gerais/EventoConfirmado'
import EventosPendentes from '@/pages/gerais/EventosPendentes'
import BuscarEventos from '@/pages/freela/BuscarEventos'
import PainelPessoaFisica from '@/pages/pf/PainelPessoaFisica'



// Páginas de freela
import CadastroFreela from '@/pages/freela/CadastroFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import PainelFreela from '@/pages/freela/PainelFreela'
import EditarFreela from '@/pages/freela/EditarFreela'


// Páginas de estabelecimento
import PerfilEstabelecimento from '@/pages/estabelecimento/PerfilEstabelecimento'
import PainelEstabelecimento from '@/pages/estabelecimento/PainelEstabelecimento'
import CadastroEstabelecimento from '@/pages/estabelecimento/CadastroEstabelecimento'
import EditarPerfilEstabelecimento from '@/pages/estabelecimento/EditarPerfilEstabelecimento'
import PublicarVaga from '@/pages/estabelecimento/PublicarVaga'
import ConfigPagamentoEstabelecimento from '@/pages/estabelecimento/ConfigPagamentoEstabelecimento'


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Gerais */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/login" element={<Login />} />
          <Route path="/esquecisenha" element={<EsqueciSenha />} />
          <Route path="/oportunidades" element={<Oportunidades />} />         
          <Route path="/pagamento-evento/:id" element={<PagamentoEvento />} />
          <Route path="/evento-confirmado" element={<EventoConfirmado />} />
          <Route path="/meuseventos" element={<EventosPendentes />} />
          <Route path="/freela/buscareventos" element={<BuscarEventos />} />
          <Route path="/painelpf" element={<PainelPessoaFisica />} />



          {/* Avaliação compartilhada */}
          <Route path="/avaliar/:tipo/:id" element={<Avaliacao />} />

          {/* Freela */}
          <Route path="/cadastrofreela" element={<CadastroFreela />} />
          <Route path="/perfilfreela/:uid" element={<PerfilFreela />} />
          <Route path="/painelfreela/:rota?" element={<PainelFreela />} />
          <Route path="/freela/editarfreela" element={<EditarFreela />} />

          {/* Estabelecimento */}
          <Route path="/cadastroestabelecimento" element={<CadastroEstabelecimento />} />
          <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento />} />
          <Route path="/painelestabelecimento/:rota?" element={<PainelEstabelecimento />} />
          <Route path="/pagamento-chamada/:id" element={<PagamentoChamada />} />
          <Route path="/editarperfilestabelecimento/:uid" element={<EditarPerfilEstabelecimento />} />
          <Route path="/publicarvaga" element={<PublicarVaga />} />
          <Route
            path="/painelestabelecimento/config-pagamento"
            element={<ConfigPagamentoEstabelecimento />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
// Projeto original FreelaJá - Código registrado e rastreável
// Assinatura interna: 𝙁𝙅-𝟮𝟬𝟮𝟱-𝘽𝘾-𝘾𝙃𝘼𝙏𝙂𝙋𝙏
