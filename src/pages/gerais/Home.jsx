import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, UserPlus, LogIn, Info, Briefcase } from 'lucide-react'

export default function Home() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false)

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-8 text-center">
        <header className="max-w-3xl mb-10">
          <h1 className="text-5xl font-serif italic font-bold drop-shadow-lg tracking-wide">
            🍽️ Bem-vindo ao Freela Já
          </h1>
          <p className="text-lg text-white max-w-xl mx-auto mt-4 drop-shadow">
            Sua plataforma para contratar ou trabalhar com liberdade, agilidade e confiança.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10">

          {/* Botão Cadastro com Dropdown */}
          <div className="relative w-full">
            <button
              onClick={() => setMostrarCadastro(!mostrarCadastro)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow"
            >
              <UserPlus className="w-5 h-5" />
              Cadastro
              <ChevronDown className="w-4 h-4" />
            </button>

            {mostrarCadastro && (
              <div className="absolute mt-1 bg-white text-black rounded shadow w-full z-20">
                <Link to="/cadastrofreela" className="block px-4 py-2 hover:bg-orange-100">Freelancer</Link>
                <Link to="/cadastroestabelecimento" className="block px-4 py-2 hover:bg-orange-100">Estabelecimento</Link>
                <Link to="/cadastropf" className="block px-4 py-2 hover:bg-orange-100">Pessoa Física</Link>
              </div>
            )}
          </div>

          <Link
            to="/login"
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Login
          </Link>

          <Link
            to="/oportunidades"
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            Oportunidades
          </Link>

          <Link
            to="/sobre"
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <Info className="w-5 h-5" />
            Sobre
          </Link>
        </div>
      </div>
    </div>
  )
}
