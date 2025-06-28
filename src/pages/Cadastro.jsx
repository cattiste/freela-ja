import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import { auth, db } from '../firebase'
import './Home.css'
=======
import { auth, db } from '@/firebase'
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

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
<<<<<<< HEAD
      // Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Salva dados públicos no Firestore, numa coleção "usuarios"
=======
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      await addDoc(collection(db, 'usuarios'), {
        uid: user.uid,
        nome,
        email,
<<<<<<< HEAD
        tipo: 'freela', // ou outro tipo, se quiser
=======
        tipo: 'freela',
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
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
<<<<<<< HEAD
    <div className="home-container">
      <h2 className="home-title">Cadastro</h2>
      <form onSubmit={handleCadastro} className="form-container">
=======
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro</h2>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
<<<<<<< HEAD
          className="input"
        />
=======
          className="input-field"
        />

>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
<<<<<<< HEAD
          className="input"
        />
=======
          className="input-field"
        />

>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
<<<<<<< HEAD
          className="input"
        />
        <button type="submit" disabled={loading} className="home-button">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
=======
          className="input-field"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    </div>
  )
}
