import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

  return (
    <nav className="bg-orange-600 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-center sm:text-left">
          <Link to="/">Freela Já!</Link>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm sm:text-base">
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
        
      </div>
    </nav>
  )
}
