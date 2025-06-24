// src/pages/CadastroEstabelecimento.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import UploadFoto from '../components/UploadImagem'
import './Home.css'

export default function CadastroEstabelecimento() {
  const navigate = useNavigate()

  const [nomeFantasia, setNomeFantasia] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [descricao, setDescricao] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFotoUpload = (url) => {
    setFotoUrl(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nomeFantasia || !email || !senha || !telefone || !endereco || !descricao) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    setLoading(true)
    try {
      // Atenção: em app real, não salve senha direto no Firestore!
      await addDoc(collection(db, 'usuarios'), {
        nomeFantasia,
        email,
        senha,
        telefone,
        endereco,
        descricao,
        foto: fotoUrl,
        tipo: 'estabelecimento'
      })
      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      alert('Erro ao cadastrar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro Estabelecimento</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Nome Fantasia"
          value={nomeFantasia}
          onChange={e => setNomeFantasia(e.target.value)}
          className="input"
          required
        />
        <input
          type="email"
          placeholder="Email"
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
          placeholder="Telefone"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
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
          rows={4}
          required
          style={{ resize: 'none' }}
        />

        <label style={{ marginTop: 12, fontWeight: 'bold', color: '#444' }}>
          Foto do Estabelecimento (opcional)
        </label>
        <UploadFoto onUploadComplete={handleFotoUpload} />

        <button type="submit" className="home-button" disabled={loading} style={{ marginTop: 20 }}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
