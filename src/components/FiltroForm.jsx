import React from 'react'
<<<<<<< HEAD
import { Link } from 'react-router-dom'
import './FiltroForm.css'
=======
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

export default function FiltroForm({
  filtroEspecialidade,
  setFiltroEspecialidade,
  filtroCidade,
  setFiltroCidade,
  filtroDisponibilidade,
  setFiltroDisponibilidade
}) {
  return (
<<<<<<< HEAD
    <div className="filtros-container">
=======
    <div className="flex flex-wrap gap-4 my-6">
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      <input
        type="text"
        placeholder="Especialidade (ex: Sushi, Churrasco...)"
        value={filtroEspecialidade}
        onChange={e => setFiltroEspecialidade(e.target.value)}
<<<<<<< HEAD
=======
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:border-blue-900 focus:outline-none"
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      />
      <input
        type="text"
        placeholder="Cidade"
        value={filtroCidade}
        onChange={e => setFiltroCidade(e.target.value)}
<<<<<<< HEAD
=======
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:border-blue-900 focus:outline-none"
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      />
      <select
        value={filtroDisponibilidade}
        onChange={e => setFiltroDisponibilidade(e.target.value)}
<<<<<<< HEAD
=======
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:border-blue-900 focus:outline-none"
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      >
        <option value="">Disponibilidade</option>
        <option>Hoje</option>
        <option>Esta semana</option>
        <option>Este mês</option>
      </select>
    </div>
  )
}
