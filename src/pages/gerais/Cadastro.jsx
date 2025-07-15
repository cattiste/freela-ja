import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'

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
      const userCredential = await import { createUserWithEmailAndPassword } from 'firebase/auth'(auth, email, senha)
      const usuario = userCredential.usuario

      await addDoc(collection(db, 'usuarios'), {
        uid: usuario.uid,
        nome,
        email,
        tipo: 'freela',
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
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro</h2>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          className="input-field"
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input-field"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
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
    </div>
  )
}
