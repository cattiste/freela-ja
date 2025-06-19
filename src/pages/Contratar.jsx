// src/pages/Contratar.jsx
import React from 'react'
import './Contratar.css'
import { useNavigate } from 'react-router-dom'

export default function Contratar() {
  const navigate = useNavigate()

  // Exemplo estático de chefs — futuramente pode puxar de um banco
  const chefs = [
    {
      id: 1,
      nome: 'Chef Bruno Cattiste',
      especialidade: 'Cozinha Italiana · Massas · Carnes',
      imagem: 'https://source.unsplash.com/300x300/?chef,1'
    },
    {
      id: 2,
      nome: 'Chef Ana Clara',
      especialidade: 'Cozinha Vegana · Saudável · Criativa',
      imagem: 'https://source.unsplash.com/300x300/?chef,2'
    },
    {
      id: 3,
      nome: 'Chef Takeshi',
      especialidade: 'Culinária Japonesa · Tradicional e Fusion',
      imagem: 'https://source.unsplash.com/300x300/?chef,3'
    }
  ]

  return (
    <div className="contratar-container">
      <h1 className="contratar-title">Encontre o Chef Ideal</h1>
      <p className="contratar-subtitle">Perfis disponíveis para contratação imediata</p>

      <div className="chef-list">
        {chefs.map((chef) => (
          <div key={chef.id} className="chef-card" onClick={() => navigate(`/perfil/${chef.id}`)}>
            <img src={chef.imagem} alt={chef.nome} />
            <h3>{chef.nome}</h3>
            <p>{chef.especialidade}</p>
            <button>Ver Perfil</button>
          </div>
        ))}
      </div>
    </div>
  )
}
