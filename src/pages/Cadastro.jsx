import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import './Home.css'

export default function Cadastro() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCadastro = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Salva dados públicos no Firestore, numa coleção "usuarios"
      await addDoc(collection(db, 'usuarios'), {
        uid: user.uid,
        nome,
        email,
        tipo: 'freela', // ou outro tipo, se quiser
        criadoEm: new Date()
      })

      setLoading(false)
      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      setError('Erro: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <h2 className="home-title">Cadastro</h2>
      <form onSubmit={handleCadastro} className="form-container">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          className="input"
        />
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
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  )
}
