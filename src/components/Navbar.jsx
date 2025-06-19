// src/components/Navbar.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{ padding: '10px', background: '#eee', textAlign: 'center' }}>
      <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
      <Link to="/sobre" style={{ margin: '0 10px' }}>Sobre</Link>
      <Link to="/cadastro" style={{ margin: '0 10px' }}>Cadastro</Link>
      <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
    </nav>
  )
}
