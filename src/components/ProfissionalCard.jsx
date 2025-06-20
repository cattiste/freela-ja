import React from 'react'
import { Link } from 'react-router-dom'
import './ProfissionalCard.css'

export default function ProfissionalCard({ prof }) {
  return (
    <div className="chef-card">
      <img src={prof.imagem} alt={prof.nome} />
      <h3>{prof.nome}</h3>
      <p>Especialidade: {prof.especialidade}</p>
      <p>Cidade: {prof.cidade}</p>
      <p>Avaliação: ⭐ {prof.avaliacao}</p>
      <Link to={`/perfil/${prof.id}`}>
        <button>Ver Perfil</button>
      </Link>
    </div>
  )
}
