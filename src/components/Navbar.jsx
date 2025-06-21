import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

  return (
    <nav className="bg-orange-600 text-white p-4 flex justify-between items-center">
      <div>
        <Link to="/" className="font-bold text-xl">ChefJá</Link>
      </div>
      <div className="flex gap 4">
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

        {usuarioLogado && (
          <button
            onClick={() => {
              localStorage.removeItem('usuarioLogado')
              window.location.href = '/'
            }}
            className="hover:underline"
          >
            Sair
          </button>
        )}
      </div>
    </nav>
  )
}
