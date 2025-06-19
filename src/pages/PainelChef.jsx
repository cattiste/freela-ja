import React from 'react'

export default function PainelChef() {
  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Painel do Chef</h2>
      <p style={styles.texto}>Bem-vindo ao seu painel, chef! Aqui você poderá:</p>
      <ul style={styles.lista}>
        <li>📋 Ver seus pedidos</li>
        <li>🍳 Gerenciar seu cardápio</li>
        <li>🧾 Atualizar seus dados</li>
        <li>💬 Ver mensagens de clientes</li>
      </ul>
      <button style={styles.botao}>Sair</button>
    </div>
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
