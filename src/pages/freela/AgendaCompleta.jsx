// ✅ src/pages/freela/AgendaCompleta.jsx

import React from 'react'
import AgendaFreela from './AgendaFreela'
import VagasDisponiveis from './VagasDisponiveis'
import EventosDisponiveis from './EventosDisponiveis'

export default function AgendaCompleta({ freelaId }) {
  if (!freelaId) {
    return <div className="text-center text-red-500">Freela ID não encontrado.</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendário */}
      <div>
        <AgendaFreela freelaId={freelaId} />
      </div>

      {/* Vagas e Eventos lado a lado */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <VagasDisponiveis freelaId={freelaId} />
        <EventosDisponiveis freelaId={freelaId} />
      </div>
    </div>
  )
}