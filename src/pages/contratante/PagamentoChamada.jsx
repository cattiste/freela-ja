// PagamentoChamada.jsx ajustado com taxa de serviço e mensagem de segurança

import React, { useState } from 'react'

export default function PagamentoChamada({ valorBase, onConfirmar }) {
  const [cartao, setCartao] = useState('')
  const [nome, setNome] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')

  const taxaContratante = valorBase * 0.10
  const valorTotal = valorBase + taxaContratante

  const confirmarPagamento = () => {
    // Aqui você integraria com a função gerarCobrancaPix ou com o gateway de cartão
    onConfirmar({ valor: valorTotal })
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold text-orange-700">Pagamento da Chamada</h2>

      <p className="text-sm text-gray-600">
        Valor base da diária: <strong>R$ {valorBase.toFixed(2)}</strong><br />
        Taxa de serviço (10%): <strong>R$ {taxaContratante.toFixed(2)}</strong><br />
        <span className="text-orange-700 font-bold">Total: R$ {valorTotal.toFixed(2)}</span>
      </p>

      <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
        🔒 Para sua segurança, não armazenamos os dados do seu cartão de crédito.
      </p>

      <input
        type="text"
        placeholder="Número do cartão"
        className="w-full border p-2 rounded"
        value={cartao}
        onChange={(e) => setCartao(e.target.value)}
      />
      <input
        type="text"
        placeholder="Nome impresso no cartão"
        className="w-full border p-2 rounded"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Validade (MM/AA)"
          className="flex-1 border p-2 rounded"
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
        />
        <input
          type="text"
          placeholder="CVV"
          className="w-20 border p-2 rounded"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
        />
      </div>

      <button
        onClick={confirmarPagamento}
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 w-full"
      >
        Confirmar Pagamento
      </button>
    </div>
  )
}
