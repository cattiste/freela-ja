import React, { useState } from 'react'

export default function PainelEstabelecimento() {
  const [pedidos, setPedidos] = useState([
    {
      id: 1,
      profissional: 'Chef Joana',
      data: '2025-06-22',
      servico: 'Buffet completo para casamento',
      status: 'em análise'
    },
    {
      id: 2,
      profissional: 'Chef Marcos',
      data: '2025-06-25',
      servico: 'Jantar corporativo para 12 pessoas',
      status: 'confirmado'
    }
  ])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Painel do Estabelecimento</h2>
      <p className="text-gray-600 mb-4">Aqui estão os pedidos que você fez:</p>

      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        pedidos.map(pedido => (
          <div key={pedido.id} className="bg-white rounded shadow p-4 mb-4 border">
            <p><strong>Profissional:</strong> {pedido.profissional}</p>
            <p><strong>Data:</strong> {pedido.data}</p>
            <p><strong>Serviço:</strong> {pedido.servico}</p>
            <p><strong>Status:</strong> {pedido.status}</p>
          </div>
        ))
      )}
    </div>
  )
}
