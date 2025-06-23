<button
  onClick={() => navigate(-1)}
  className="botao-voltar-home"
  aria-label="Voltar"
>
  ← Voltar
</button>

<button
  onClick={() => navigate('/')}
  className="botao-voltar-home botao-home-painel"
  aria-label="Home"
>
  🏠 Home
</button>

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Reutilizando o estilo ChefJá

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const usuario = usuarios.find(u => u.email === email && u.senha === senha)

    if (usuario) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario))
      alert('Login realizado com sucesso!')

      if (usuario.tipo === 'freela') {
        navigate('/painelfreela')
      } else {
        navigate('/painel')
      }
    } else {
      alert('E-mail ou senha inválidos.')
    }
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Entrar na Plataforma</h1>

      <form onSubmit={handleLogin}>
        <label>E-mail</label>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />

        <label>Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input"
          required
        />

        <button type="submit" className="home-button">
          Entrar
        </button>
      </form>
    </div>
  )
}
