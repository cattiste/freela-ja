// src/pages/CadastroFreela.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import UploadFoto from '../components/UploadImagem'
import './Home.css'

export default function CadastroFreela() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // Essa função vai receber a URL do UploadFoto
  const handleFotoUpload = (url) => {
    setFotoUrl(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    setLoading(true)
    try {
      // Atenção: em app real, não salve senha direto no Firestore!
      await addDoc(collection(db, 'usuarios'), {
        nome,
        email,
        senha,
        celular,
        endereco,
        funcao,
        foto: fotoUrl,
        tipo: 'freela'
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
      <h1 className="home-title">Cadastro Freelancer</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
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
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          className="input"
          required
        />

        <label style={{ marginTop: 12, fontWeight: 'bold', color: '#444' }}>
          Foto de Perfil (opcional)
        </label>
        <UploadFoto onUploadComplete={handleFotoUpload} />

        <button type="submit" className="home-button" disabled={loading} style={{ marginTop: 20 }}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
