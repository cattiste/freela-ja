// src/pages/Contratar.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import './Contratar.css'

export default function Contratar() {
  const profissionais = [
    {
      id: 1,
      nome: 'João Silva',
      especialidade: 'Comida Italiana',
      cidade: 'São Paulo',
      avaliacao: 4.7,
      imagem: 'https://randomuser.me/api/portraits/men/10.jpg',
    },
    {
      id: 2,
      nome: 'Ana Oliveira',
      especialidade: 'Sushi Tradicional',
      cidade: 'Rio de Janeiro',
      avaliacao: 4.9,
      imagem: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    {
      id: 3,
      nome: 'Carlos Mendes',
      especialidade: 'Garçom Profissional',
      cidade: 'Belo Horizonte',
      avaliacao: 4.5,
      imagem: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
  ]

  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Encontre o Profissional Ideal</h2>
      <p className="contratar-subtitle">Filtre por área, cidade ou disponibilidade</p>

      <div className="filtros-container">
        <input type="text" placeholder="Especialidade (ex: Garçom, Cozinheiro...)" />
        <input type="text" placeholder="Cidade" />
        <select>
          <option>Disponibilidade</option>
          <option>Hoje</option>
          <option>Esta semana</option>
          <option>Este mês</option>
        </select>
        <button>Buscar</button>
      </div>

      <div className="resultado-chefs">
        {profissionais.map((prof) => (
          <div key={prof.id} className="chef-card">
            <img src={prof.imagem} alt={prof.nome} className="chef-image" />
            <h3>{prof.nome}</h3>
            <p><strong>Área:</strong> {prof.especialidade}</p>
            <p><strong>Cidade:</strong> {prof.cidade}</p>
            <p><strong>Avaliação:</strong> ⭐ {prof.avaliacao.toFixed(1)}</p>
            <Link to={`/perfil/${prof.id}`}>
              <button>Ver Perfil</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
