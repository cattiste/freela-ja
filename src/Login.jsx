// src/pages/Login.jsx
import React, { useState } from 'react'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Login realizado com:\nEmail: ${email}\nSenha: ${senha}`)
    // Aqui entraria a lógica real de autenticação futuramente
  }

  return (
    <div className="login-container">
      <h2>Entrar na Plataforma</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
