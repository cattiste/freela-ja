import React from 'react'
import { Route } from 'react-router-dom'
import RotaProtegidaEstabelecimento from '@/components/protegidas/RotaProtegidaEstabelecimento.jsx'
import CadastroEstabelecimento from '@/pages/estabelecimento/CadastroEstabelecimento'
import EditarPerfilEstabelecimento from '@/pages/estabelecimento/EditarPerfilEstabelecimento'
import PainelEstabelecimento from '@/pages/estabelecimento/PainelEstabelecimento'
import PublicarVaga from '@/pages/estabelecimentoPublicarVaga.jsx'
import Avaliacao from '@/pages/gerais/Avaliacao'
import PublicarEvento from '@/pages/gerais/PublicarEvento'

console.log('🔁 Render RotasPublicas')

export const RotasEstabelecimento = ({ usuario }) => (
  <>
    <Route path="/cadastroestabelecimento" element={<CadastroEstabelecimento />} />
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
    <Route
       path="/publicarevento"
       element={
         <RotaProtegidaEstabelecimento>
            <PublicarEvento estabelecimento={usuario} />
         </RotaProtegidaEstabelecimento>
      }
    />
  </>
)
