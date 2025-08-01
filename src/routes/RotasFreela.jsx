import React from 'react'
import { Route } from 'react-router-dom'
import RotaProtegidaFreela from '@/components/protegidas/RotaProtegidaFreela.jsx'
import CadastroFreela from '@/pages/CadastroFreela'
import EditarFreela from '@/pages/EditarFreela'
import PainelFreela from '@/pages/PainelFreela'
import PerfilFreela from '@/pages/PerfilFreela'
import VagasDisponiveis from '@/pages/VagasDisponiveis'
import PublicarEvento from '@/pages/PublicarEvento'
import EventosDisponiveis from '@/pages/EventosDisponiveis'
import CadastroEvento from '@/pages/CadastroEvento'

console.log('🔁 Render RotasPublicas')

export const RotasFreela = ({ usuario }) => (
  <>
    <Route path="/cadastrofreela" element={<CadastroFreela />} />
    <Route path="/editarfreela/:id" element={<EditarFreela />} />
    <Route path="/perfilfreela/:id" element={<PerfilFreela />} />
    <Route path="/vagasdisponiveis" element={<VagasDisponiveis freela={usuario} />} />
    <Route path="/eventosdisponiveis" element={<EventosDisponiveis freela={usuario} />} />

    <Route
      path="/painelfreela/*"
      element={
        <RotaProtegidaFreela>
          <PainelFreela />
        </RotaProtegidaFreela>
      }
    />
    <Route
      path="/vagasdisponiveis"
      element={
        <RotaProtegidaFreela>
          <VagasDisponiveis freela={usuario} />
        </RotaProtegidaFreela>
      }
    />
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
    <Route path="/cadastroevento" element={<CadastroEvento />} />
  </>
)
