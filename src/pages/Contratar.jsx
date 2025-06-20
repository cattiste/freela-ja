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
    <div className="contratar-container">
      <h2 className="contratar-title">Painel de Profissionais</h2>
      <p className="contratar-subtitle">Filtre por especialidade, cidade ou disponibilidade</p>

      <FiltroForm
        filtroEspecialidade={filtroEspecialidade}
        setFiltroEspecialidade={setFiltroEspecialidade}
        filtroCidade={filtroCidade}
        setFiltroCidade={setFiltroCidade}
        filtroDisponibilidade={filtroDisponibilidade}
        setFiltroDisponibilidade={setFiltroDisponibilidade}
      />

      <div className="resultado-chefs">
        {resultado.length > 0 ? (
          resultado.map(prof => <ProfissionalCard key={prof.id} prof={prof} />)
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            Nenhum profissional encontrado com esses filtros.
          </p>
        )}
      </div>
    </div>
  )
}
