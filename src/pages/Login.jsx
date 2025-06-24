import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'  // Importa auth do firebase.js
import './Home.css'  // Certifique-se que seu CSS está importado

export default function Login() {
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

      // Salva dados do usuário no localStorage
      localStorage.setItem('usuarioLogado', JSON.stringify({ uid: user.uid, email: user.email, tipo: 'freela' }))

      setLoading(false)
      navigate('/painelfreela')
    } catch (err) {
      setError('Erro: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <h2 className="home-title">Entrar na Plataforma</h2>
      <form onSubmit={handleLogin} className="form-container">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          className="input"
        />
        <button type="submit" disabled={loading} className="home-button">
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
      {error && <p className="error-text" style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  )
}
