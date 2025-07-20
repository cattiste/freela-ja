import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreelaCard from '@/pages/freela/PerfilFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import Chamadas from '@/components/ChamadaInline'
import Eventos from '@/pages/freela/EventosDisponiveis'
import Vagas from '@/pages/freela/VagasDisponiveis'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import HistoricoFreela from '@/pages/freela/HistoricoTrabalhosFreela'
import AgendaCompleta from '@/pages/freela/AgendaCompleta'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')

  if (carregando) {
    return <div className="text-center mt-10">Verificando autenticação...</div>
  }

  if (!usuario) {
    return <div className="text-center mt-10">Usuário não autenticado.</div>
  }

  const freelaId = usuario.uid

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <PerfilFreelaCard freelaId={freela.uid} />
            <AgendaFreela freelaId={freela.uid} />
            <AvaliacoesRecebidasFreela freelaUid={freelaId} />
          </div>
        )
      case 'agenda':
        return <AgendaCompleta freelaId={freela.uid} />
      case 'chamadas':
        return <Chamadas freelaId={freela.uid} />
      case 'eventos':
        return <Eventos freelaId={freela.uid} />
      case 'vagas':
        return <Vagas freelaId={freela.uid} />
      case 'config':
        return <ConfiguracoesFreela freelaId={freela.uid} />
      case 'historico':
        return <HistoricoFreela freelaId={freela.uid} />
      default:
        return null
    }
  } // 👈 ESSA CHAVE estava faltando!

  return (
    <div>
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
