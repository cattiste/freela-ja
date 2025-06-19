// src/components/Navbar.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#222',
      color: '#fff',
    }}>
      <h2>ChefJá</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
        <Link to="/sobre" style={{ color: '#fff', textDecoration: 'none' }}>Sobre</Link>
        <Link to="/cadastro" style={{ color: '#fff', textDecoration: 'none' }}>Cadastro</Link>
        <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
      </div>
    </nav>
  )
}
