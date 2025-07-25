import React from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-8 text-center">
        <header className="max-w-3xl mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow">
            Bem-vindo ao Freela Já
          </h1>
          <p className="text-lg text-white max-w-xl mx-auto mb-6 drop-shadow">
            Conectando profissionais e estabelecimentos em uma plataforma simples, direta e eficiente.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
          <Link
            to="/cadastrofreela"
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow"
          >
            Freelancer
          </Link>

          <Link
            to="/cadastroestabelecimento"
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow"
          >
            Estabelecimento
          </Link>

          <Link
            to="/login"
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow"
          >
            Login
          </Link>

          <Link
            to="/oportunidades"
            className="px-6 py-3 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200"
          >
            Oportunidades
          </Link>

          <Link
            to="/sobre"
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow"
          >
            Sobre
          </Link>

          <Link
            to="/cadastropf"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow"
          >
            <PlusCircle className="w-5 h-5" />
            Cadastro de Evento
          </Link>
        </div>
      </div>
    </div>
  )
}
