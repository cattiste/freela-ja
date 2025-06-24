import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import './Home.css'

export default function CadastroEstabelecimento() {
  const navigate = useNavigate()

  const [nomeFantasia, setNomeFantasia] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCadastro = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      await addDoc(collection(db, 'usuarios'), {
        uid: user.uid,
        nomeFantasia,
        email,
        telefone,
        endereco,
        tipo: 'estabelecimento',
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
      <h2 className="home-title">Cadastro Estabelecimento</h2>
      <form onSubmit={handleCadastro} className="form-container">
        <input
          type="text"
          placeholder="Nome Fantasia"
          value={nomeFantasia}
          onChange={e => setNomeFantasia(e.target.value)}
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
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          required
          className="input"
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
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
