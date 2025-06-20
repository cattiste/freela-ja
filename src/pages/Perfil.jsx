// src/pages/Perfil.jsx
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './perfilprofissional.css'
import { profissionais } from '../data/profissionais' // ✅ Mantém só esse

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()

  const profissional = profissionais.find(p => p.id === id)

  if (!profissional) {
    return <div className="perfil-container">Profissional não encontrado.</div>
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <img src={profissional.imagem} alt={profissional.nome} />
        <div className="perfil-info">
          <h2>{profissional.nome}</h2>
          <p><strong>Especialidade:</strong> {profissional.especialidade}</p>
          <p><strong>Cidade:</strong> {profissional.cidade}</p>
          <p className="perfil-avaliacao">⭐ {profissional.avaliacao}</p>
        </div>
      </div>

      <p>{profissional.descricao}</p>

      <button className="botao-voltar" onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  )
}
