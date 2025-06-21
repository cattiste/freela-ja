import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-orange-50 px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-700 mb-6">Bem-vindo ao <span className="text-orange-900">Freela Já</span></h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10">
          Conectando <span className="font-semibold text-orange-700">profissionais</span> e <span className="font-semibold text-orange-700">estabelecimentos</span> em uma plataforma simples, direta e eficiente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/cadastro-freela")}
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded shadow font-bold"
          >
            Sou um Freelancer
          </button>
          <button
            onClick={() => navigate("/cadastro-estabelecimento")}
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded shadow font-bold"
          >
            Sou um Estabelecimento
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-white border border-orange-600 text-orange-700 py-3 rounded shadow font-bold hover:bg-orange-100"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/contratar")}
            className="bg-white border border-orange-600 text-orange-700 py-3 rounded shadow font-bold hover:bg-orange-100"
          >
            Painel de Vagas
          </button>
        </div>
      </div>
    </div>
  )
}
