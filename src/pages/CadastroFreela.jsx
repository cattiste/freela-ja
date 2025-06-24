import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import './Home.css'

export default function CadastroFreela() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Função para upload da foto para Cloudinary
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'ml_default') // seu upload preset do Cloudinary
      // Substitua 'dbemvuau3' pelo seu cloud name do Cloudinary
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
    setError('')
    setLoading(true)

    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
      setError('Preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        email,
        celular,
        endereco,
        funcao,
        foto, // salva a URL da imagem que veio do Cloudinary
        tipo: 'freela'
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
      <h2 className="home-title">Cadastro Freelancer</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Nome"
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
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          className="input"
          required
        />

        <label>Foto de Perfil (opcional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUploadFoto}
          disabled={uploading}
        />
        {uploading && <p>Enviando foto...</p>}
        {error && <p className="error-text">{error}</p>}
        {foto && <img src={foto} alt="Preview" style={{ width: 80, borderRadius: 40, marginTop: 8 }} />}

        <button type="submit" className="home-button" disabled={loading || uploading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
