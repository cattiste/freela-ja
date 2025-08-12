// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ⚠️ Não precisa importar AuthProvider aqui (já está em main.jsx)

// Gerais
import Home from '@/pages/gerais/Home'
import Sobre from '@/pages/gerais/Sobre'
import Login from '@/pages/gerais/Login'
import EsqueciSenha from '@/pages/gerais/EsqueciSenha'
import Oportunidades from '@/pages/gerais/Oportunidades'
import PagamentoEvento from '@/pages/gerais/PagamentoEvento'
import EventoConfirmado from '@/pages/gerais/EventoConfirmado'
import EventosPendentes from '@/pages/gerais/EventosPendentes'
import BuscarEventos from '@/pages/freela/BuscarEventos'
import CadastroPessoaFisica from '@/pages/pf/CadastroPessoaFisica'
import PagamentoPix from '@/pages/gerais/PagamentoPix'
import DashboardAdmin from '@/components/DashboardAdmin'
import BuscarFreelas from '@/components/BuscarFreelas'
import Privacidade from '@/pages/gerais/Privacidade'
import Termos from '@/pages/gerais/Termos'
import RequireRole from '@/components/RequireRole'

// Freela
import CadastroFreela from '@/pages/freela/CadastroFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import PainelFreela from '@/pages/freela/PainelFreela'
import EditarFreela from '@/pages/freela/EditarFreela'

// Estabelecimento
import CadastroEstabelecimento from '@/pages/estabelecimento/CadastroEstabelecimento'
import PerfilEstabelecimento from '@/pages/estabelecimento/PerfilEstabelecimento'
import PainelEstabelecimento from '@/pages/estabelecimento/PainelEstabelecimento'
import EditarPerfilEstabelecimento from '@/pages/estabelecimento/EditarPerfilEstabelecimento'
import PublicarVaga from '@/pages/estabelecimento/PublicarVaga'
import PagamentoChamada from '@/pages/estabelecimento/PagamentoChamada'

// Pessoa Física
import PainelPessoaFisica from '@/pages/pf/PainelPessoaFisica'
import CandidaturasPF from '@/pages/pf/CandidaturasPF'
import AgendaEventosPF from '@/pages/pf/AgendaEventosPF'
import EditarPerfilPessoaFisica from '@/pages/pf/EditarPerfilPessoaFisica'
import PerfilPessoaFisica from '@/pages/pf/PerfilPessoaFisica'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Gerais */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esquecisenha" element={<EsqueciSenha />} />
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route path="/pagamentoevento/:id" element={<PagamentoEvento />} />
        <Route path="/eventoconfirmado" element={<EventoConfirmado />} />
        <Route path="/meuseventos" element={<EventosPendentes />} />
        <Route path="/freela/buscareventos" element={<BuscarEventos />} />
        <Route path="/cadastropf" element={<CadastroPessoaFisica />} />
        <Route path="/pagamentopix" element={<PagamentoPix />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />

        {/* 👤 Freela */}
        <Route path="/cadastrofreela" element={<CadastroFreela />} />
        <Route path="/perfilfreela/:uid" element={<PerfilFreela />} />
        <Route
          path="/painelfreela"
          element={
            <RequireRole allow={['freela','admin']}>
              <PainelFreela/>
            </RequireRole>
          }
        />
        <Route path="/freela/editarfreela" element={<EditarFreela />} />

        {/* 🏢 Estabelecimento */}
        <Route path="/cadastroestabelecimento" element={<CadastroEstabelecimento />} />
        <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento />} />
        <Route
          path="/painelestabelecimento/*"
          element={
            <RequireRole allow={['estabelecimento','admin']}>
              <PainelEstabelecimento/>
            </RequireRole>
          }
        />
        <Route path="/estabelecimento/editarperfilestabelecimento" element={<EditarPerfilEstabelecimento />} />
        <Route path="/publicarvaga" element={<PublicarVaga />} />
        <Route path="/pagamentochamada/:id" element={<PagamentoChamada />} />

        {/* 👤 Pessoa Física */}
        <Route
          path="/pf"
          element={
            <RequireRole allow={['pessoa_fisica','admin']}>
              <PainelPessoaFisica/>
            </RequireRole>
          }
        />
        <Route
          path="/pf/editarperfil"
          element={
            <RequireRole allow={['pessoa_fisica','admin']}>
              <EditarPerfilPessoaFisica/>
            </RequireRole>
          }
        />
        <Route path="/pf/candidaturas" element={<CandidaturasPF />} />
        <Route path="/pf/agenda" element={<AgendaEventosPF />} />
        <Route path="/pf/buscar" element={<BuscarFreelas />} />

        {/* Perfil público da Pessoa Física (opcional, útil pra compartilhamento) */}
        <Route path="/perfilpessoafisica/:uid" element={<PerfilPessoaFisica />} />

        {/* ✅ Redirecionamentos/ajustes */}
        {/* Antiga rota duplicada do painel PF → agora redireciona para /pf */}
        <Route path="/painelpf" element={<Navigate to="/pf" replace />} />
        <Route path="/painelestabelecimento/chamadas" element={<Navigate to="/painelestabelecimento/ativas" />} />

        {/* 404 opcional: */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
