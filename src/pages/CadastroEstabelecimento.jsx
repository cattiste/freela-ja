import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './Home.css'

export default function CadastroEstabelecimento() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [descricao, setDescricao] = useState('')
  const [foto, setFoto] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!nome || !email || !senha || !celular || !endereco || !descricao) {
      setError('Preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Salvar dados no Firestore com UID como ID do documento
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        email,
        celular,
        endereco,
        descricao,
        foto,
        tipo: 'estabelecimento'
      })

      setLoading(false)
      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      setError('Erro ao cadastrar: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <h2 className="home-title">Cadastro Estabelecimento</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Nome do Estabelecimento"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="input"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="input"
          required
        />
        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
          className="input"
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="input"
          required
        />
        <textarea
          placeholder="Descrição do estabelecimento"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="input"
          required
          rows={4}
        />
        <input
          type="text"
          placeholder="URL Foto (opcional)"
          value={foto}
          onChange={e => setFoto(e.target.value)}
          className="input"
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="home-button" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
