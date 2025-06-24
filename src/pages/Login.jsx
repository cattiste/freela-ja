import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { app } from '../firebase'
import './Home.css'

export default function Login() {
  const auth = getAuth(app)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      localStorage.setItem('usuarioLogado', JSON.stringify({ uid: user.uid, email: user.email, tipo: 'freela' }))

      setLoading(false)
      navigate('/painelfreela')
    } catch (err) {
      setError('E-mail ou senha inválidos')
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: 400,
      margin: '60px auto',
      padding: 24,
      borderRadius: 10,
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      backgroundColor: '#121212',
      color: '#eee',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Entrar na Plataforma</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            border: '1px solid #444',
            backgroundColor: '#222',
            color: '#eee',
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            border: '1px solid #444',
            backgroundColor: '#222',
            color: '#eee',
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#4CAF50',
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={e => {
            if(!loading) e.currentTarget.style.backgroundColor = '#45a049'
          }}
          onMouseLeave={e => {
            if(!loading) e.currentTarget.style.backgroundColor = '#4CAF50'
          }}
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
      {error && <p style={{ color: '#ff4d4d', marginTop: 16, textAlign: 'center' }}>{error}</p>}
    </div>
  )
}
