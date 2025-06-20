// src/pages/Perfil.jsx
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Perfil.css'

const profissionais = [
  {
    id: '1',
    nome: 'João Silva',
    especialidade: 'Comida Italiana',
    cidade: 'São Paulo',
    imagem: 'https://randomuser.me/api/portraits/men/32.jpg',
    avaliacao: 4.8
  },
  {
    id: '2',
    nome: 'Ana Oliveira',
    especialidade: 'Sushi Tradicional',
    cidade: 'Rio de Janeiro',
    imagem: 'https://randomuser.me/api/portraits/women/44.jpg',
    avaliacao: 4.9
  }
]

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const profissional = profissionais.find((p) => p.id === id)

  if (!profissional) {
    return (
      <div className="perfil-container">
        <h2>Profissional não encontrado</h2>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    )
  }

  return (
    <div className="perfil-container">
      <img className="perfil-foto" src={profissional.imagem} alt={profissional.nome} />
      <h2 className="perfil-nome">{profissional.nome}</h2>
      <p><strong>Especialidade:</strong> {profissional.especialidade}</p>
      <p><strong>Cidade:</strong> {profissional.cidade}</p>
      <p><strong>Avaliação:</strong> ⭐ {profissional.avaliacao}</p>
      <button onClick={() => navigate(-1)}>Voltar</button>
    </div>
  )
}
