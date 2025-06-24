import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
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

      // Buscar o usuário no Firestore pela UID
      const userRef = doc(db, 'usuarios', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()

        // Salvar dados no localStorage
        localStorage.setItem('usuarioLogado', JSON.stringify({
          uid: user.uid,
          email: user.email,
          nome: userData.nome,
          tipo: userData.tipo
        }))

        // Redirecionar com base no tipo
        if (userData.tipo === 'freela') {
          navigate('/painelfreela')
        } else if (userData.tipo === 'estabelecimento') {
          navigate('/painel-estabelecimento')
        } else {
          setError('Tipo de usuário inválido.')
        }

      } else {
        setError('Usuário não encontrado na base de dados.')
      }

    } catch (err) {
      console.error(err)
      setError('E-mail ou senha inválidos.')
    } finally {
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
