import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './Home.css'

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

      // Buscar dados do usuário no Firestore pelo uid
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        localStorage.setItem('usuarioLogado', JSON.stringify({ uid: user.uid, email: user.email, tipo: userData.tipo }))

        setLoading(false)
        if (userData.tipo === 'freela') {
          navigate('/painelfreela')
        } else if (userData.tipo === 'estabelecimento') {
          navigate('/painel-estabelecimento')
        } else {
          alert('Tipo de usuário inválido.')
          setLoading(false)
        }
      } else {
        alert('Usuário não encontrado no banco de dados.')
        setLoading(false)
      }
    } catch (err) {
      setError('E-mail ou senha inválidos')
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
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
