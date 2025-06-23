import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

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
      } else if (usuario.tipo === 'estabelecimento') {
        navigate('/painelestabelecimento')
      } else {
        alert('Tipo de usuário desconhecido.')
      }
    } else {
      alert('E-mail ou senha inválidos.')
    }
  }

  return (
    <>
      <div className="w-full max-w-md flex justify-between fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => navigate(-1)}
          className="botao-voltar-home"
          aria-label="Voltar"
          style={{ left: '20px', right: 'auto', position: 'fixed' }}
        >
          ← Voltar
        </button>

        <button
          onClick={() => navigate('/')}
          className="botao-voltar-home botao-home-painel"
          aria-label="Home"
          style={{ right: '20px', left: 'auto', position: 'fixed' }}
        >
          🏠 Home
        </button>
      </div>

      <div className="home-container">
        <h1 className="home-title">Entrar na Plataforma</h1>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
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

        <div className="mt-6 flex justify-between">
          <button onClick={() => navigate('/cadastrofreela')} className="text-sm text-blue-600 underline">
            Sou Freelancer
          </button>
          <button onClick={() => navigate('/cadastroestabelecimento')} className="text-sm text-blue-600 underline">
            Sou Estabelecimento
          </button>
        </div>
      </div>
    </>
  )
}
