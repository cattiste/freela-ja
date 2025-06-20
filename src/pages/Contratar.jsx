import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profissionais } from '../data/profissionais'
import ProfissionalCard from '../components/ProfissionalCard'
import FiltroForm from '../components/FiltroForm'

export default function Contratar() {
  const navigate = useNavigate()
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('')

  const filtrarProfissionais = () => {
    return profissionais.filter(pro =>
      pro.especialidade.toLowerCase().includes(filtroEspecialidade.toLowerCase()) &&
      pro.cidade.toLowerCase().includes(filtroCidade.toLowerCase())
    )
  }

  const resultado = filtrarProfissionais()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Painel de Profissionais</h2>
      <p className="text-center text-gray-500 mb-8">Filtre por especialidade, cidade ou disponibilidade</p>

      <FiltroForm
        filtroEspecialidade={filtroEspecialidade}
        setFiltroEspecialidade={setFiltroEspecialidade}
        filtroCidade={filtroCidade}
        setFiltroCidade={setFiltroCidade}
        filtroDisponibilidade={filtroDisponibilidade}
        setFiltroDisponibilidade={setFiltroDisponibilidade}
      />

      <div className="grid gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">
        {resultado.length > 0 ? (
          resultado.map(prof => <ProfissionalCard key={prof.id} prof={prof} />)
        ) : (
          <p className="col-span-full text-center text-gray-600">
            Nenhum profissional encontrado com esses filtros.
          </p>
        )}
      </div>
    </div>
  )
}
