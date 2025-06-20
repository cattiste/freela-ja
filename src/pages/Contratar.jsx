// src/pages/Contratar.jsx
import React from 'react'
import './Contratar.css'

export default function Contratar() {
  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Encontre o Profissional Ideal</h2>
      <p className="contratar-subtitle">Filtre por função, cidade ou disponibilidade</p>

      <div className="filtros-container">
        <input type="text" placeholder="Função (ex: Garçom, Cozinheiro, Faxina...)" />
        <input type="text" placeholder="Cidade" />
        <select>
          <option>Disponibilidade</option>
          <option>Hoje</option>
          <option>Esta semana</option>
          <option>Este mês</option>
        </select>
        <button>Buscar</button>
      </div>

      <div className="resultado-profissionais">
        <div className="profissional-card">
          <h3>João Silva</h3>
          <p>Função: Cozinheiro Profissional</p>
          <p>Cidade: São Paulo</p>
          <button>Ver Perfil</button>
        </div>
        <div className="profissional-card">
          <h3>Ana Oliveira</h3>
          <p>Função: Garçonete</p>
          <p>Cidade: Rio de Janeiro</p>
          <button>Ver Perfil</button>
        </div>
      </div>
    </div>
  )
}
