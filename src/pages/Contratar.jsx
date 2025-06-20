// src/pages/Contratar.jsx
import React from 'react'
import './Contratar.css'

export default function Contratar() {
  return (
    <div className="contratar-container">
      <h1>Encontre o Chef Ideal</h1>
      <p>
        Aqui você pode encontrar chefs profissionais para atender seu restaurante, evento, cozinha particular ou operação delivery.
      </p>

      <div className="contratar-info">
        <h2>Como funciona?</h2>
        <ul>
          <li>✅ Chefs verificados</li>
          <li>📍 Filtragem por localização e especialidade</li>
          <li>📆 Disponibilidade em tempo real</li>
          <li>💬 Contato direto com o chef</li>
        </ul>
      </div>

      <button className="btn-procurar">Começar busca</button>
    </div>
  )
}
