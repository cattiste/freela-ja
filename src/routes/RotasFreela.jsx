import React from 'react'
import { Route } from 'react-router-dom'
import RotaProtegidaFreela from '../components/protegidas/RotaProtegidaFreela.jsx'
import CadastroFreela from '../pages/freelas/CadastroFreela'
import EditarFreela from '../pages/freelas/EditarFreela'
import PainelFreela from '../pages/freelas/PainelFreela'
import PerfilFreela from '../pages/freelas/PerfilFreela'
import VagasDisponiveis from '../pages/gerais/VagasDisponiveis'
import PublicarEvento from '../pages/gerais/PublicarEvento'
import EventosDisponiveis from '../pages/gerais/EventosDisponiveis'
import CadastroEvento from '../pages/gerais/CadastroEvento'

export const RotasFreela = ({ usuario }) => (
  <>
    <Route path="/cadastrofreela" element={<CadastroFreela />} />
    <Route path="/editarfreela/:id" element={<EditarFreela />} />
    <Route path="/perfilfreela/:id" element={<PerfilFreela />} />

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
