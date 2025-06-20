import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ChefJá</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Início</Link></li>
        <li><Link to="/sobre">Sobre</Link></li>
        <li><Link to="/contratar">Profissionais</Link></li>
        <li><Link to="/cadastro">Cadastro</Link></li>
        <li><Link to="/login">Entrar</Link></li>
      </ul>
    </nav>
  )
}
