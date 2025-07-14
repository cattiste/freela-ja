import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        <Link
          to="/cadastrofreela"
          className="px-6 py-3 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200"
        >
          Freelancer
        </Link>

        <Link
          to="/cadastro-estabelecimento"
          className="px-6 py-3 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200"
        >
          Estabelecimento
        </Link>

        <Link
          to="/login"
          className="px-6 py-3 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200"
        >
          Login
        </Link>

        <Link
          to="/painelvagas"
          className="px-6 py-3 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200"
        >
          Painel de Vagas
        </Link>

        <Link
          to="/sobre"
          className="px-6 py-3 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200"
        >
          Sobre
        </Link>

        <Link
          to="/publicarevento"
          className="px-6 py-3 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200"
        >
          Publicar Evento
        </Link>        
      </div>
    </div>
  )
}
