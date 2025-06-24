import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { app } from '../firebase'

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

      // Salvar info do usuário no localStorage - aqui só email e uid
      // Para tipo, buscaremos no Firestore no painel
      localStorage.setItem('usuarioLogado', JSON.stringify({ uid: user.uid, email: user.email, tipo: 'freela' }))

      setLoading(false)
      navigate('/painelfreela')
    } catch (err) {
      setError('E-mail ou senha inválidos')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Entrar na Plataforma</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  )
}
