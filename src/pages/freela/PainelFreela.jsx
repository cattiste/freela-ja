// ✅ src/pages/freela/PainelFreela.jsx atualizado
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
import RecebimentosFreela from '@/pages/freela/RecebimentosFreela'
import ChamadasFreela from '@/pages/freela/ChamadasFreela'


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
            <PerfilFreelaCard freelaId={freelaId} />
            <AgendaFreela freelaId={freelaId} />
            <AvaliacoesRecebidasFreela freelaUid={freelaId} />
          </div>
        )
      case 'agenda':
        return <AgendaCompleta freelaId={freelaId} />
      case 'chamadas':
        return <ChamadasFreela />
      case 'eventos':
        return <Eventos freelaId={freelaId} />
      case 'vagas':
        return <Vagas freelaId={freelaId} />
      case 'config':
        return <ConfiguracoesFreela freelaId={freelaId} />
      case 'historico':
        return <HistoricoFreela freelaId={freelaId} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela /> 
      case 'recebimentos':
        return <RecebimentosFreela freelaId={freelaId} />
      default:
        return null
    }
  }

  return (
    <div className="p-4 pb-20">
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
