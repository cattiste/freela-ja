import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import Chamadas from '@/pages/freela/Chamadas'
import Eventos from '@/pages/freela/Eventos'
import Vagas from '@/pages/freela/Vagas'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import HistoricoFreela from '@/pages/freela/HistoricoFreela'

export default function PainelFreela() {
  const { usuario } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')

  if (!usuario) {
    return <div className="text-center mt-10">Carregando dados do usuário...</div>
  }

  const freelaId = usuario.uid

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <PerfilFreela freelaId={freelaId} />
            <AgendaFreela freelaId={freelaId} />
            <AvaliacoesRecebidasFreela freelaUid={freelaId} />
          </div>
        )
      case 'chamadas':
        return <Chamadas freelaId={freelaId} />
      case 'eventos':
        return <Eventos freelaId={freelaId} />
      case 'vagas':
        return <Vagas freelaId={freelaId} />
      case 'config':
        return <ConfiguracoesFreela freelaId={freelaId} />
      case 'historico':
        return <HistoricoFreela freelaId={freelaId} />
      default:
        return null
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-center">Painel do Freela</h1>
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} />
    </div>
  )
}
