import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const tipo = new URLSearchParams(location.search).get('tipo') || 'freela'

  const handleSubmit = (e) => {
    e.preventDefault()

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

    const novoUsuario = {
      nome,
      email,
      senha,
      tipo
    }

    usuarios.push(novoUsuario)
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
    localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario))

    alert('Cadastro realizado com sucesso!')

    navigate(tipo === 'estabelecimento' ? '/painel-estabelecimento' : '/painel')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
      <div style={styles.container}>
        <h2 style={styles.titulo}>Cadastro</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Crie uma senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.botao}>Cadastrar</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '60px auto',
    padding: '30px',
    backgroundColor: '#fff8f0',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0
