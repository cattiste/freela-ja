import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

  return (
    <nav className="bg-orange-600 text-white p-4 flex flex-wrap justify-between items-center shadow-md">
      <div className="text-2xl font-bold">
        <Link to="/">Freela Já!</Link>
      </div>

      <div className="flex flex-wrap gap-4 items-center text-sm sm:text-base mt-2 sm:mt-0">
        <Link to="/" className="hover:underline">Início</Link>
        <Link to="/sobre" className="hover:underline">Sobre</Link>
        <Link to="/contratar" className="hover:underline">Contratar</Link>

        {!usuarioLogado && (
          <>
            <Link to="/cadastro" className="hover:underline">Cadastro</Link>
            <Link to="/login" className="hover:underline">Login</Link>
          </>
        )}

        {usuarioLogado?.tipo === 'freela' && (
          <Link to="/painel" className="hover:underline">Painel do Chef</Link>
        )}

        {usuarioLogado?.tipo === 'estabelecimento' && (
          <Link to="/painel-estabelecimento" className="hover:underline">Painel do Estabelecimento</Link>
        )}
      </div>
    </nav>
  )
}
