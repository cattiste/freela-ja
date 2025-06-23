import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Reutiliza o mesmo estilo visual da plataforma

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const encontrado = usuarios.find(
      u =>
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.senha === senha
    )

    if (encontrado) {
      localStorage.setItem('usuarioLogado', JSON.stringify(encontrado))

      if (encontrado.tipo === 'estabelecimento') {
        navigate('/painel-estabelecimento')
      } else {
        navigate('/painel')
      }
    } else {
      setErro('E-mail ou senha incorretos.')
      setSenha('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            autoComplete="off"
          />
          {erro && <p style={styles.erro}>{erro}</p>}
          <button type="submit" style={styles.botao}>Entrar</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '60px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  botao: {
    padding: '10px',
    backgroundColor: '#ff6b00',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  erro: {
    color: 'red',
    textAlign: 'center',
    marginTop: '-10px'
  }
}
