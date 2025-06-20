import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4">
        Bem-vindo ao Freela Já
      </h1>
      <p className="text-gray-700 text-lg sm:text-xl max-w-xl mb-8">
        Conectando profissionais e estabelecimentos em uma plataforma simples, direta e eficiente.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap justify-center">
        <button
          onClick={() => navigate('/cadastro')}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sou um Freelancer
        </button>
        <button
          onClick={() => navigate('/painel-estabelecimento')}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Sou um Estabelecimento
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Já tenho conta
        </button>
        <button
          onClick={() => navigate('/contratar')}
          className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          Painel de Profissionais
        </button>
      </div>
    </div>
  )
}
