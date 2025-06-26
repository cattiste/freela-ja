import React from 'react'
import { Link } from 'react-router-dom'
import './FiltroForm.css'

export default function FiltroForm({
  filtroEspecialidade,
  setFiltroEspecialidade,
  filtroCidade,
  setFiltroCidade,
  filtroDisponibilidade,
  setFiltroDisponibilidade
}) {
  return (
    <div className="filtros-container">
      <input
        type="text"
        placeholder="Especialidade (ex: Sushi, Churrasco...)"
        value={filtroEspecialidade}
        onChange={e => setFiltroEspecialidade(e.target.value)}
      />
      <input
        type="text"
        placeholder="Cidade"
        value={filtroCidade}
        onChange={e => setFiltroCidade(e.target.value)}
      />
      <select
        value={filtroDisponibilidade}
        onChange={e => setFiltroDisponibilidade(e.target.value)}
      >
        <option value="">Disponibilidade</option>
        <option>Hoje</option>
        <option>Esta semana</option>
        <option>Este mês</option>
      </select>
    </div>
  )
}
