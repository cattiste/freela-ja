// src/pages/CadastroFreela.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { storage, db } from '../firebase'
import './Home.css'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Upload da foto para Firebase Storage
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const storageRef = ref(storage, `fotos/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setFoto(url)
    } catch (err) {
      setError('Erro ao enviar a foto: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Geolocalizar endereço usando API Nominatim OpenStreetMap
  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`
      )
      const data = await res.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (err) {
      console.error('Erro geolocalizando:', err)
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
      alert('Preencha todos os campos')
      return
    }

    const coordenadas = await geolocalizarEndereco(endereco)
    if (!coordenadas) {
      alert('Não foi possível localizar o endereço. Seja mais específico.')
      return
    }

    const novoFreela = {
      nome,
      email,
      senha,
      celular,
      endereco,
      funcao,
      foto,
      coordenadas,
      tipo: 'freela'
    }

    try {
      await addDoc(collection(db, 'usuarios'), novoFreela)
      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      alert('Erro ao salvar cadastro: ' + err.message)
    }
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro Freelancer</h1>
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
        <div>
          <label>Foto de Perfil (opcional)</label>
          <input type="file" accept="image/*" onChange={handleUploadFoto} />
          {uploading && <p>Enviando foto...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {foto && <img src={foto} alt="Preview" style={{ width: 80, borderRadius: 40, marginTop: 8 }} />}
        </div>
        <button type="submit" className="home-button" disabled={uploading}>
          Cadastrar
        </button>
      </form>
    </div>
  )
}
