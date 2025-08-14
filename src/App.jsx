// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// 🌐 Gerais
import Home from '@/pages/gerais/Home'
import Sobre from '@/pages/gerais/Sobre'
import Login from '@/pages/gerais/Login'
import EsqueciSenha from '@/pages/gerais/EsqueciSenha'
import Oportunidades from '@/pages/gerais/Oportunidades'
import PagamentoEvento from '@/pages/gerais/PagamentoEvento'
import EventoConfirmado from '@/pages/gerais/EventoConfirmado'
import EventosPendentes from '@/pages/gerais/EventosPendentes'
import BuscarEventos from '@/pages/freela/BuscarEventos'
import PagamentoPix from '@/pages/gerais/PagamentoPix'
import DashboardAdmin from '@/components/DashboardAdmin'
import BuscarFreelas from '@/components/BuscarFreelas'
import Privacidade from '@/pages/gerais/Privacidade'
import Termos from '@/pages/gerais/Termos'
import RequireRole from '@/components/RequireRole'

// 👤 Freela
import CadastroFreela from '@/pages/freela/CadastroFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import PainelFreela from '@/pages/freela/PainelFreela'
import EditarFreela from '@/pages/freela/EditarFreela'

// 🏢 Estabelecimento
import CadastroEstabelecimento from '@/pages/estabelecimento/CadastroEstabelecimento'
import PerfilEstabelecimento from '@/pages/estabelecimento/PerfilEstabelecimento'
import PainelEstabelecimento from '@/pages/estabelecimento/PainelEstabelecimento'
import EditarPerfilEstabelecimento from '@/pages/estabelecimento/EditarPerfilEstabelecimento'
import PublicarVaga from '@/pages/estabelecimento/PublicarVaga'
import PagamentoChamada from '@/pages/estabelecimento/PagamentoChamada'

// 🤝 Contratante (Pessoa Física)
import CadastroContratante from '@/pages/contratante/CadastroContratante'
import PainelContratante from '@/pages/contratante/PainelContratante'
import EditarPerfilContratante from '@/pages/contratante/EditarPerfilContratante'
import PerfilContratante from '@/pages/contratante/PerfilContratante'

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
        <Route path="/pagamentopix" element={<PagamentoPix />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />

        {/* 👤 Freela */}
        <Route path="/cadastrofreela" element={<CadastroFreela />} />
        <Route path="/perfilfreela/:uid" element={<PerfilFreela />} />
        <Route path="/painelfreela" element={
          <RequireRole allow={['freela', 'admin']}>
            <PainelFreela />
          </RequireRole>
        } />
        <Route path="/freela/editarfreela" element={
          <RequireRole allow={['freela', 'admin']}>
            <EditarFreela />
          </RequireRole>
        } />

        {/* 🏢 Estabelecimento */}
        <Route path="/cadastroestabelecimento" element={<CadastroEstabelecimento />} />
        <Route path="/perfilestabelecimento/:uid" element={<PerfilEstabelecimento />} />
        <Route path="/painelestabelecimento/*" element={
          <RequireRole allow={['estabelecimento', 'admin']}>
            <PainelEstabelecimento />
          </RequireRole>
        } />
        <Route path="/estabelecimento/editarperfilestabelecimento" element={
          <RequireRole allow={['estabelecimento', 'admin']}>
            <EditarPerfilEstabelecimento />
          </RequireRole>
        } />
        <Route path="/publicarvaga" element={<PublicarVaga />} />
        <Route path="/pagamentochamada/:id" element={<PagamentoChamada />} />

        {/* ✅ Redirecionamentos úteis */}
        <Route path="/estabelecimento/chamadasestabelecimento" element={<Navigate to="/estabelecimento/ativas" />} />

        {/* 🤝 Contratante */}
        <Route path="/cadastrocontratante" element={<CadastroContratante />} />
        <Route path="/perfilcontratante/:uid" element={<PerfilContratante />} />
        <Route path="/painelcontratante" element={
          <RequireRole allow={['contratante', 'admin']}>
            <PainelContratante />
          </RequireRole>
        } />
        <Route path="/contratante/editarperfilcontratante" element={
          <RequireRole allow={['contratante', 'admin']}>
            <EditarPerfilContratante />
          </RequireRole>
        } />

        {/* 404 opcional */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
