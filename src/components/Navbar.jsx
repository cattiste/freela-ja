// src/components/Navbar.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h1 style={styles.logo}>ChefJá</h1>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/sobre" style={styles.link}>Sobre</Link>
        <Link to="/cadastro" style={styles.link}>Cadastro</Link>
        <Link to="/login" style={styles.link}>Login</Link>
        <Link to="/painel" style={styles.link}>Painel</Link>
        <Link to="/contratar" style={styles.link}>Contratar um Chef</Link>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#ff6b00',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
  },
  links: {
    display: 'flex',
    gap: '15px'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500'
  }
}
