// src/pages/gerais/EventoConfirmado.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function EventoConfirmado() {
  return (
    <div className="max-w-xl mx-auto mt-20 bg-white p-6 rounded-xl shadow-lg text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-4">🎉 Evento Confirmado!</h1>
      <p className="text-gray-700 mb-6">Seu evento foi publicado com sucesso e já pode ser visualizado pelos freelas disponíveis.</p>
      <Link
        to="/"
        className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
      >
        Voltar para o Início
      </Link>
    </div>
  )
}
