import React from 'react'
import { Route } from 'react-router-dom'
import RotaProtegidaEstabelecimento from '../components/protegidas/RotaProtegidaEstabelecimento.jsx'


import CadastroEstabelecimento from '../pages/estabelecimentos/CadastroEstabelecimento'
import EditarPerfilEstabelecimento from '../pages/estabelecimentos/EditarPerfilEstabelecimento'
import PainelEstabelecimento from '../pages/estabelecimentos/PainelEstabelecimento'
import PublicarVaga from '../components/gerais/PublicarVaga.jsx'
import Avaliacao from '../components/gerais/Avaliacao'

export const RotasEstabelecimento = ({ usuario }) => (
  <>
    <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
    <Route path="/editarperfilestabelecimento" element={<EditarPerfilEstabelecimento />} />
    <Route path="/avaliacao/:tipo/:id" element={<Avaliacao />} />

    <Route
      path="/painel-estabelecimento/*"
      element={
        <RotaProtegidaEstabelecimento>
          <PainelEstabelecimento />
        </RotaProtegidaEstabelecimento>
      }
    />
    <Route
      path="/publicarvaga"
      element={
        <RotaProtegidaEstabelecimento>
          <PublicarVaga estabelecimento={usuario} />
        </RotaProtegidaEstabelecimento>
      }
    />
  </>
)
