import React from 'react'
import AgendaFreela from './AgendaFreela'
import VagasDisponiveis from '../VagasDisponiveis'
import EventosDisponiveis from '../EventosDisponiveis'

export default function AgendaCompleta({ freela }) {
  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendário */}
      <div>
        <AgendaFreela freela={freela} />
      </div>

      {/* Vagas e Eventos lado a lado */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <VagasDisponiveis freela={freela} />
        <EventosDisponiveis freela={freela} />
      </div>
    </div>
  )
}
