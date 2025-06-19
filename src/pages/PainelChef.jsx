// src/pages/PainelChef.jsx
import React from 'react'
import './PainelChef.css'

export default function PainelChef() {
  return (
    <div className="painel-chef-container">
      <h1>Bem-vindo ao Painel do Chef</h1>
      <p>Aqui você poderá gerenciar seus serviços, cardápio, disponibilidade e mais.</p>

      <div className="painel-opcoes">
        <div className="opcao">📅 Gerenciar Agenda</div>
        <div className="opcao">🍽️ Meus Serviços</div>
        <div className="opcao">🧾 Pedidos Recebidos</div>
        <div className="opcao">✏️ Editar Perfil</div>
      </div>
    </div>
  )
}
