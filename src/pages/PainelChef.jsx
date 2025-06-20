import React, { useState, useEffect } from 'react'

export default function PainelChef() {
  const [usuario, setUsuario] = useState(null)
  const [pedidos, setPedidos] = useState([
    {
      id: 1,
      cliente: 'Joana Ribeiro',
      data: '2025-06-18',
      descricao: 'Almoço vegano para 6 pessoas no sábado',
      status: 'pendente'
    },
    {
      id: 2,
      cliente: 'Carlos Mendes',
      data: '2025-06-20',
      descricao: 'Jantar italiano para comemoração de aniversário',
      status: 'pendente'
    }
  ])

  useEffect(() => {
    const logado = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (logado) {
      setUsuario(logado)
    }
  }, [])

  const aceitarPedido = (id) => {
    setPedidos(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'aceito' } : p
      )
    )
  }

  const recusarPedido = (id) => {
    setPedidos(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'recusado' } : p
      )
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Painel do Chef</h2>
      {usuario && <p>Bem-vindo, {usuario.nome}!</p>}

      <h3 style={{ marginTop: '2rem' }}>Pedidos Recebidos</h3>
      {pedidos.map(pedido => (
        <div key={pedido.id} style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#f9f9f9'
        }}>
          <p><strong>Cliente:</strong> {pedido.cliente}</p>
          <p><strong>Data:</strong> {pedido.data}</p>
          <p><strong>Descrição:</strong> {pedido.descricao}</p>
          <p><strong>Status:</strong> {pedido.status}</p>
          {pedido.status === 'pendente' && (
            <div>
              <button onClick={() => aceitarPedido(pedido.id)} style={{ marginRight: '1rem' }}>
                Aceitar
              </button>
              <button onClick={() => recusarPedido(pedido.id)}>
                Recusar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
