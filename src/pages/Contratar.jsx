// src/pages/Contratar.jsx
import React from 'react'
import './Contratar.css'

export default function Contratar() {
  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Encontre o Chef Perfeito</h2>
      <p className="contratar-subtitle">Filtre por especialidade, cidade ou disponibilidade</p>

      <div className="filtros-container">
        <input type="text" placeholder="Especialidade (ex: Sushi, Churrasco...)" />
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
        <div className="chef-card">
          <h3>Chef João Silva</h3>
          <p>Especialidade: Comida Italiana</p>
          <p>Cidade: São Paulo</p>
          <button>Ver Perfil</button>
        </div>
        <div className="chef-card">
          <h3>Chef Ana Oliveira</h3>
          <p>Especialidade: Sushi Tradicional</p>
          <p>Cidade: Rio de Janeiro</p>
          <button>Ver Perfil</button>
        </div>
      </div>
    </div>
  )
}
