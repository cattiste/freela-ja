import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import UploadImagem from '../components/UploadImagem'  // aqui o nome correto do componente
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

  const handleFotoUpload = (url) => {
    setFotoUrl(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
      alert('Preencha todos os campos')
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, 'usuarios'), {
        nome,
        email,
        senha,
        celular,
        endereco,
        funcao,
        foto: fotoUrl || '',
        tipo: 'freela'
      })
      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (error) {
      alert('Erro ao cadastrar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro Freelancer</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input" required />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" required />
        <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="input" required />
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" required />
        <input type="text" placeholder="Função" value={funcao} onChange={e => setFuncao(e.target.value)} className="input" required />

        {/* Upload da imagem */}
        <UploadImagem onUploadComplete={handleFotoUpload} />

        <button type="submit" className="home-button" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
