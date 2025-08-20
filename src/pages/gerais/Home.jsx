// src/pages/gerais/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import {
  UserPlus,
  LogIn,
  Info,
  Briefcase,
  MessageCircleMore
} from 'lucide-react'

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-8 text-center">
        <header className="max-w-3xl mb-10">
          <h1 className="text-5xl font-serif italic font-bold drop-shadow-lg tracking-wide">
            🍽️ Bem-vindo ao Freela Já
          </h1>
          <p className="text-lg text-white max-w-xl mx-auto mt-4 drop-shadow">
            Sua plataforma para contratar ou trabalhar com liberdade, agilidade e confiança.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
          {/* Botão Cadastro Contratante */}
          <Link
            to="/cadastrocontratante"
            className="w-full px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Preciso de um Freela
          </Link>

          {/* Botão Cadastro Freela */}
          <Link
            to="/cadastrofreela"
            className="w-full px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Sou um Freela
          </Link>

          {/* Login */}
          <Link
            to="/login"
            className="w-full px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Login
          </Link>

          {/* Oportunidades */}
          <Link
            to="/oportunidades"
            className="w-full px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            Oportunidades
          </Link>

          {/* Sobre */}
          <Link
            to="/sobre"
            className="w-full px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <Info className="w-5 h-5" />
            Sobre
          </Link>

          {/* Suporte */}
          <Link
            to="/suporte"
            className="w-full px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow flex items-center justify-center gap-2"
          >
            <MessageCircleMore className="w-5 h-5" />
            Suporte
          </Link>
        </div>
      </div>
    </div>
  )
}
