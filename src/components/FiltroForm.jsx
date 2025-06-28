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
    <div className="flex flex-wrap gap-4 my-6">
      <input
        type="text"
        placeholder="Especialidade (ex: Sushi, Churrasco...)"
        value={filtroEspecialidade}
        onChange={e => setFiltroEspecialidade(e.target.value)}
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:border-blue-900 focus:outline-none"
      />
      <input
        type="text"
        placeholder="Cidade"
        value={filtroCidade}
        onChange={e => setFiltroCidade(e.target.value)}
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:border-blue-900 focus:outline-none"
      />
      <select
        value={filtroDisponibilidade}
        onChange={e => setFiltroDisponibilidade(e.target.value)}
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:border-blue-900 focus:outline-none"
      >
        <option value="">Disponibilidade</option>
        <option>Hoje</option>
        <option>Esta semana</option>
        <option>Este mês</option>
      </select>
    </div>
  )
}
