import React from 'react'
import { Route } from 'react-router-dom'
import RotaProtegidaFreela from '@/components/protegidas/RotaProtegidaFreela.jsx'
import CadastroFreela from '@/pages/freela/CadastroFreela'
import EditarFreela from '@/pages/freela/EditarFreela'
import PainelFreela from '@/pages/freela/PainelFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import VagasDisponiveis from '@/pages/freela/VagasDisponiveis'
import EventosDisponiveis from '@/pages/freela/EventosDisponiveis'


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
