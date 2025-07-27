import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreelaCard from '@/pages/freela/PerfilFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import ChamadasFreela from '@/pages/freela/ChamadasFreela'
import Eventos from '@/pages/freela/EventosDisponiveis'
import Vagas from '@/pages/freela/VagasDisponiveis'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import HistoricoFreela from '@/pages/freela/HistoricoTrabalhosFreela'
import AgendaCompleta from '@/pages/freela/AgendaCompleta'
import RecebimentosFreela from '@/pages/freela/RecebimentosFreela'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')

  if (carregando) return <div className="text-center mt-10">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10">Usuário não autenticado.</div>

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <PerfilFreelaCard freelaId={usuario.uid} />
            <AgendaFreela freela={usuario} />
            <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
          </div>
        )
      case 'agenda':
        return <AgendaCompleta freelaId={usuario.uid} />
      case 'chamadas':
        return <ChamadasFreela />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
      case 'eventos':
        return <Eventos freelaId={usuario.uid} />
      case 'vagas':
        return <Vagas freelaId={usuario.uid} />
      case 'config':
        return <ConfiguracoesFreela freelaId={usuario.uid} />
      case 'historico':
        return <HistoricoFreela freelaId={usuario.uid} />
      case 'recebimentos':
        return <RecebimentosFreela freelaId={usuario.uid} />
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
