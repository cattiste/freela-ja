import React from 'react'
import './ProfissionalCard.css'

export default function ProfissionalCard({ prof }) {
  return (
    <div className="card-profissional">
      <img src={prof.imagem} alt={prof.nome} className="card-foto" />
      <h3>{prof.nome}</h3>
      <p><strong>Especialidade:</strong> {prof.especialidade}</p>
      <p><strong>Cidade:</strong> {prof.cidade}</p>
      <p><strong>Avaliação:</strong> ⭐ {prof.avaliacao.toFixed(1)}</p>
      <p className="descricao">{prof.descricao}</p>
      <button className="card-botao">📩 Chamar</button>
    </div>
  )
}
