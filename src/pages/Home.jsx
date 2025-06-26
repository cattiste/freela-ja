import React from 'react'
import { useNavigate } from 'react-router-dom'
import ListaProfissionais from '../components/ListaProfissionais'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 p-8 text-center">
      <header className="max-w-3xl mb-8">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-2">
          Bem-vindo ao Freela Já
        </h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto mb-6">
          Conectando profissionais e estabelecimentos em uma plataforma simples, direta e eficiente.
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-4 w-full max-w-lg mb-10">
        <button
          onClick={() => navigate('/cadastrofreela')}
          className="flex-1 max-w-xs bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
        >
          Freelancer
        </button>
        <button
          onClick={() => navigate('/cadastro-estabelecimento')}
          className="flex-1 max-w-xs bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
        >
          Estabelecimento
        </button>
        <button
          onClick={() => navigate('/login')}
          className="flex-1 max-w-xs bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/curriculos')}
          className="flex-1 max-w-xs bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
        >
          Currículos
        </button>
        <button
          onClick={() => navigate('/sobre')}
          className="flex-1 max-w-xs bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
        >
          Sobre
        </button>
      </div>

      <main className="w-full max-w-6xl">
        <ListaProfissionais />
      </main>
    </div>
  )
}
