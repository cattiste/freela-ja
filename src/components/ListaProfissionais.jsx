import React, { useState } from 'react'
import { profissionais } from '../data/profissionais'
import ProfissionalCard from './ProfissionalCard'
import FiltroForm from './FiltroForm'

export default function ListaProfissionais() {
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')

  const filtrados = profissionais.filter(prof => {
    return (
      prof.especialidade.toLowerCase().includes(filtroEspecialidade.toLowerCase()) &&
      prof.cidade.toLowerCase().includes(filtroCidade.toLowerCase())
    )
  })

  return (
    <div className="p-4">
      <FiltroForm
        filtroEspecialidade={filtroEspecialidade}
        setFiltroEspecialidade={setFiltroEspecialidade}
        filtroCidade={filtroCidade}
        setFiltroCidade={setFiltroCidade}
        filtroDisponibilidade={''}
        setFiltroDisponibilidade={() => {}}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {filtrados.length > 0 ? (
          filtrados.map(prof => (
            <ProfissionalCard key={prof.id} prof={prof} />
          ))
        ) : (
          <p className="text-center text-gray-600">Nenhum profissional encontrado.</p>
        )}
      </div>
    </div>
  )
}
