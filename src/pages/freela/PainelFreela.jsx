import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

// Componentes básicos
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreelaCard from '@/pages/freela/PerfilFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'

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
      default:
        return <div className="text-center mt-4 text-gray-500">Aba não encontrada.</div>
    }
  }

  return (
    <div className="p-4 pb-20">
      {renderConteudo()}
      <MenuInferiorFreela
        onSelect={setAbaSelecionada}
        abaAtiva={abaSelecionada}
        alertas={{ chamadas: false, agenda: false, avaliacoes: false, recebimentos: false }}
      />
    </div>
  )
}
