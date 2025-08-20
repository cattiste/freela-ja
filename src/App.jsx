// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@/styles/leaflet.css'

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

// 🏢 Contratante
import CadastroContratante from '@/pages/contratante/CadastroContratante'
import PerfilContratante from '@/pages/contratante/PerfilContratante'
import PainelContratante from '@/pages/contratante/PainelContratante'
import EditarPerfilContratante from '@/pages/contratante/EditarPerfilContratante'
import PublicarVaga from '@/pages/contratante/PublicarVaga'
import PagamentoChamada from '@/pages/contratante/PagamentoChamada'

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
        <Route path="/admin" element={usuario?.tipo === 'admin'? <DashboardAdmin />: <Navigate to="/" />
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

        {/* 🏢 Contratante */}
        <Route path="/cadastrocontratante" element={<CadastroContratante />} />
        <Route path="/perfilcontratante/:uid" element={<PerfilContratante />} />
        <Route path="/painelcontratante/*" element={
          <RequireRole allow={['contratante', 'admin']}>
            <PainelContratante />
          </RequireRole>
        } />
        <Route path="/contratante/editarperfilcontratante" element={
          <RequireRole allow={['contratante', 'admin']}>
            <EditarPerfilContratante />
          </RequireRole>
        } />
        <Route path="/publicarvaga" element={<PublicarVaga />} />
        <Route path="/pagamentochamada/:id" element={<PagamentoChamada />} />
        <Route path="/contratante/chamadascontratante" element={<Navigate to="/contratante/ativas" />} />

        {/* 404 opcional */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
