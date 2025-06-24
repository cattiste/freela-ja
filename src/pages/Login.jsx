// src/pages/Login.jsx
import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
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
      const credenciais = await signInWithEmailAndPassword(auth, email, senha)
      const user = credenciais.user

      // Buscar no Firestore os dados do usuário
      const q = query(collection(db, 'usuarios'), where('uid', '==', user.uid))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        throw new Error('Usuário autenticado, mas não encontrado na base de dados.')
      }

      const dadosUsuario = snapshot.docs[0].data()

      localStorage.setItem('usuarioLogado', JSON.stringify({
        uid: user.uid,
        email: user.email,
        nome: dadosUsuario.nome,
        tipo: dadosUsuario.tipo,
        funcao: dadosUsuario.funcao || '',
        endereco: dadosUsuario.endereco || '',
        foto: dadosUsuario.foto || '',
      }))

      // Salva todos no localStorage (opcional para uso offline/local)
      const todosUsuarios = []
      snapshot.forEach(doc => todosUsuarios.push(doc.data()))
      localStorage.setItem('usuarios', JSON.stringify(todosUsuarios))

      // Redireciona
      if (dadosUsuario.tipo === 'freela') {
        navigate('/painelfreela')
      } else if (dadosUsuario.tipo === 'estabelecimento') {
        navigate('/painel-estabelecimento')
      } else {
        throw new Error('Tipo de usuário não reconhecido.')
      }
    } catch (err) {
      console.error(err)
      setError('E-mail, senha ou cadastro inválido.')
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
