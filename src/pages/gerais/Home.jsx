import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, UserPlus, LogIn, Info, Briefcase } from 'lucide-react'

export default function Home() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const dropdownRef = useRef(null)
  const btnRef = useRef(null)

  // Fecha ao clicar fora
  useEffect(() => {
    function onClickOutside(e) {
      if (!mostrarCadastro) return
      if (dropdownRef.current?.contains(e.target)) return
      if (btnRef.current?.contains(e.target)) return
      setMostrarCadastro(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setMostrarCadastro(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [mostrarCadastro])

  // Toggle + acessibilidade
  const toggleDropdown = () => setMostrarCadastro((v) => !v)
  const closeAndFocusBtn = () => {
    setMostrarCadastro(false)
    btnRef.current?.focus()
  }

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
          {/* Botão Cadastro com Dropdown */}
          <div className="relative w-full">
            <button
              ref={btnRef}
              onClick={toggleDropdown}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 transition duration-200 shadow"
              aria-haspopup="menu"
              aria-expanded={mostrarCadastro}
              aria-controls="cadastro-menu"
            >
              <UserPlus className="w-5 h-5" />
              Cadastro
              <ChevronDown className="w-4 h-4" />
            </button>

            {mostrarCadastro && (
              <div
                id="cadastro-menu"
                ref={dropdownRef}
                role="menu"
                aria-label="Opções de cadastro"
                className="absolute left-0 right-0 mt-1 bg-white text-black rounded-lg shadow-lg z-20 overflow-hidden"
              >
                <Link
                  to="/cadastrofreela"
                  role="menuitem"
                  className="block px-4 py-2 hover:bg-orange-100 focus:bg-orange-100 outline-none"
                  onClick={closeAndFocusBtn}
                >
                  Freelancer
                </Link>
                <Link
                  to="/cadastroestabelecimento"
                  role="menuitem"
                  className="block px-4 py-2 hover:bg-orange-100 focus:bg-orange-100 outline-none"
                  onClick={closeAndFocusBtn}
                >
                  Estabelecimento
                </Link>
                <Link
                  to="/cadastropf"
                  role="menuitem"
                  className="block px-4 py-2 hover:bg-orange-100 focus:bg-orange-100 outline-none"
                  onClick={closeAndFocusBtn}
                >
                  Pessoa Física
                </Link>
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
