import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './Home.css'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Upload para Cloudinary
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'ml_default') // seu upload preset
      // Troque 'dbemvuau3' pelo seu cloud name do Cloudinary
      const res = await fetch('https://api.cloudinary.com/v1_1/dbemvuau3/image/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setFoto(data.secure_url)
    } catch (err) {
      setError('Erro ao enviar a foto: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
      alert('Preencha todos os campos')
      return
    }

    // Aqui você pode criar usuário no Firebase Auth também, se quiser.

    try {
      await addDoc(collection(db, 'usuarios'), {
        nome,
        email,
        senha, // Em app real, nunca salve senha no Firestore! Aqui só para exemplo.
        celular,
        endereco,
        funcao,
        foto,
        tipo: 'freela'
      })
      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      alert('Erro ao salvar cadastro: ' + err.message)
    }
  }

  return (
    <>
          <div className="w-full max-w-md flex justify-between fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => navigate(-1)}
              className="botao-voltar-home"
              aria-label="Voltar"
              style={{ left: '20px', right: 'auto', position: 'fixed' }}
            >
              ← Voltar
            </button>
    
            <button
              onClick={() => navigate('/')}
              className="botao-voltar-home botao-home-painel"
              aria-label="Home"
              style={{ right: '20px', left: 'auto', position: 'fixed' }}
            >
              🏠 Home
            </button>
          </div>
          
    <div className="home-container">
      <h1 className="home-title">Cadastro Freelancer</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" required />
        <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="input" required />
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" required />
        <input type="text" placeholder="Função" value={funcao} onChange={e => setFuncao(e.target.value)} className="input" required />
        <label>Foto de Perfil (opcional)</label>
        <input type="file" accept="image/*" onChange={handleUploadFoto} />
        {uploading && <p>Enviando foto...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {foto && <img src={foto} alt="Preview" style={{ width: 80, borderRadius: 40, marginTop: 8 }} />}
        <button type="submit" className="home-button" disabled={uploading}>Cadastrar</button>
      </form>
    </div>
  )
}
