// src/pages/gerais/EventoConfirmado.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function EventoConfirmado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4 drop-shadow-sm">
          🎉 Evento Confirmado!
        </h1>
        <p className="text-gray-700 mb-6">
          Seu evento foi publicado com sucesso e já pode ser visualizado
          pelos freelas disponíveis.
        </p>
        <Link
          to="/"
          className="inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  )
}
