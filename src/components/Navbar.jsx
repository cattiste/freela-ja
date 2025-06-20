import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/">Freela Já</Link>
        </div>
        <ul className="flex gap-4 text-sm sm:text-base">
          <li>
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">Início</Link>
          </li>
          <li>
            <Link to="/sobre" className="text-gray-700 hover:text-blue-600 transition">Sobre</Link>
          </li>
          <li>
            <Link to="/contratar" className="text-gray-700 hover:text-blue-600 transition">Profissionais</Link>
          </li>
          <li>
            <Link to="/cadastro" className="text-gray-700 hover:text-blue-600 transition">Cadastro</Link>
          </li>
          <li>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">Entrar</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
