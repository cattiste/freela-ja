import React from 'react'

export default function FiltroForm({
  filtroEspecialidade,
  setFiltroEspecialidade,
  filtroCidade,
  setFiltroCidade,
  filtroDisponibilidade,
  setFiltroDisponibilidade
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
      <input
        type="text"
        placeholder="Especialidade (ex: Sushi, Churrasco...)"
        value={filtroEspecialidade}
        onChange={e => setFiltroEspecialidade(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Cidade"
        value={filtroCidade}
        onChange={e => setFiltroCidade(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={filtroDisponibilidade}
        onChange={e => setFiltroDisponibilidade(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Disponibilidade</option>
        <option>Hoje</option>
        <option>Esta semana</option>
        <option>Este mês</option>
      </select>
    </div>
  )
}
