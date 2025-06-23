import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Contratar.css'
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
    <>
      <div className="w-full max-w-md flex justify-between fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => navigate(-1)}
          className="botao-voltar-home"
          aria-label="Voltar"
          style={{ left: '20px', right: 'auto', position: 'fixed' }}
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="botao-voltar-home botao-home-painel"
          aria-label="Home"
          style={{ right: '20px', left: 'auto', position: 'fixed' }}
        >
          🏠 Home
        </button>
      </div>

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
    </>
  )
}  // <-- Falta fechar aqui!
