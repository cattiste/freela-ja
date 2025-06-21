import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Bem-vindo ao <span className="text-orange-700">Freela Já</span></h1>

      <p className="text-gray-700 text-lg md:text-xl max-w-xl mb-6">
        Conectando profissionais e estabelecimentos em uma plataforma simples, direta e eficiente.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate("/cadastro-freela")}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded font-semibold"
        >
          Sou um Freelancer
        </button>
        <button
          onClick={() => navigate("/cadastro-estabelecimento")}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded font-semibold"
        >
          Sou um Estabelecimento
        </button>
        <button
          onClick={() => navigate("/login")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded font-semibold"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/contratar")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded font-semibold"
        >
          Painel de Vagas
        </button>
      </div>
    </div>
  )
}
