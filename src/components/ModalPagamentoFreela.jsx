// src/components/ModalPagamentoFreela.jsx
import React from 'react'

export default function ModalPagamentoFreela({ freela, onClose }) {
  if (!freela) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-orange-700 mb-4">💳 Pagar {freela.nome}</h2>
        <p className="text-sm text-gray-700 mb-2">
          Valor da diária: <strong>R$ {freela.valorDiaria}</strong>
        </p>
        <p className="text-sm text-gray-700 mb-2">
          Será necessário confirmar o pagamento após aceitar a chamada.
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
        >
          OK
        </button>
      </div>
    </div>
  )
}
