import React, { useEffect, useState } from 'react'

export default function PainelEstabelecimento() {
  const [meusPedidos, setMeusPedidos] = useState([])

  useEffect(() => {
    // Aqui você buscaria os pedidos do contratante logado
    // Simulação simples puxando do localStorage ou mock
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    const pedidosMock = [
      {
        id: 101,
        servico: 'Jantar com Chef Bruno',
        data: '2025-06-22',
        status: 'Aceito',
        detalhes: 'Evento de 10 pessoas em Moema'
      },
      {
        id: 102,
        servico: 'Buffet completo',
        data: '2025-07-03',
        status: 'Pendente',
        detalhes: 'Evento corporativo para 50 convidados'
      }
    ]

    if (usuario) {
      setMeusPedidos(pedidosMock)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Meus Pedidos</h2>
      {meusPedidos.map(pedido => (
        <div
          key={pedido.id}
          className="border border-gray-200 rounded p-4 mb-4 bg-orange-50"
        >
          <p><strong>Serviço:</strong> {pedido.servico}</p>
          <p><strong>Data:</strong> {pedido.data}</p>
          <p><strong>Status:</strong> {pedido.status}</p>
          <p><strong>Detalhes:</strong> {pedido.detalhes}</p>
        </div>
      ))}
    </div>
  )
}
