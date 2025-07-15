import React from 'react'
import AgendaFreela from './AgendaFreela'
import VagasDisponiveis from './VagasDisponiveis'
import EventosDisponiveis from './EventosDisponiveis'

export default function AgendaCompleta({ freela }) {
  return (
    <div>
      <h1>Testando renderização</h1>
      <p>{freela?.nome || 'Sem nome'}</p>
    </div>
  )
}