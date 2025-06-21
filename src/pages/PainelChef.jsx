import React, { useState } from 'react'

export default function PainelChef() {
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
      <p>Bem-vindo, Chef Bruno!</p>

      <h3>Pedidos Recebidos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {pedidos.map(pedido => (
          <div key={pedido.id} style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: '#f9f9f9'
          }}>
            <p><strong>Cliente:</strong> {pedido.cliente}</p>
            <p><strong>Data:</strong> {pedido.data}</p>
            <p><strong>Descrição:</strong> {pedido.descricao}</p>
            <p><strong>Status:</strong> {pedido.status}</p>
            {pedido.status === 'pendente' && (
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => aceitarPedido(pedido.id)}
                  style={{ marginRight: '1rem', padding: '6px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Aceitar
                </button>
                <button
                  onClick={() => recusarPedido(pedido.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Recusar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
