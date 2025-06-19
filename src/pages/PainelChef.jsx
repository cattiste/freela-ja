// src/pages/PainelChef.jsx
import React from 'react'
import './PainelChef.css'

export default function PainelChef() {
  const nomeChef = 'Chef Bruno' // depois será dinâmico via login

  return (
    <div className="painel-container">
      <h1>Bem-vindo, {nomeChef}!</h1>
      <p>Esse é o seu painel. Aqui você gerencia seu perfil, pedidos e cardápio.</p>

      <div className="painel-buttons">
        <button>Editar Perfil</button>
        <button>Ver Pedidos</button>
        <button>Cadastro de Cardápio</button>
      </div>

      <a href="/" className="logout-link">Sair</a>
    </div>
  )
}
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '30px',
    backgroundColor: '#fff8f0',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  titulo: {
    fontSize: '28px',
    marginBottom: '10px',
    color: '#333'
  },
  texto: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#555'
  },
  lista: {
    paddingLeft: '20px',
    fontSize: '16px',
    marginBottom: '30px',
    color: '#444'
  },
  botao: {
    padding: '12px 24px',
    backgroundColor: '#ff6b00',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
}
