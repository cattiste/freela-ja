// src/pages/PerfilProfissional.jsx
import React from 'react'
import './PerfilProfissional.css'

export default function PerfilProfissional() {
  // Exemplo de dados (mais tarde serão dinâmicos)
  const profissional = {
    nome: 'João Silva',
    especialidade: 'Garçom',
    cidade: 'São Paulo',
    avaliacao: 4.8,
    bio: 'Profissional com mais de 10 anos de experiência em atendimento. Trabalhou em grandes eventos e restaurantes renomados.',
    foto: 'https://randomuser.me/api/portraits/men/32.jpg'
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <img src={profissional.foto} alt={profissional.nome} className="perfil-foto" />
        <div className="perfil-info">
          <h2>{profissional.nome}</h2>
          <p><strong>Especialidade:</strong> {profissional.especialidade}</p>
          <p><strong>Cidade:</strong> {profissional.cidade}</p>
          <p><strong>Avaliação:</strong> ⭐ {profissional.avaliacao}</p>
          <p className="perfil-bio">{profissional.bio}</p>
          <button className="btn-contatar">Contatar Profissional</button>
        </div>
      </div>
    </div>
  )
}
