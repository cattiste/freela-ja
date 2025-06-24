import React, { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import UploadImagem from '../components/UploadImagem'
import './Home.css'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`
      )
      const data = await response.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (err) {
      console.error('Erro ao geolocalizar:', err)
    }
    return null
  }

  const handleCadastro = async (e) => {
    e.preventDefault()

    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      const coordenadas = await geolocalizarEndereco(endereco)

      await addDoc(collection(db, 'usuarios'), {
        uid: user.uid,
        nome,
        email,
        celular,
        endereco,
        funcao,
        foto,
        tipo: 'freela',
        coordenadas,
        criadoEm: new Date()
      })

      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro Freelancer</h1>
      <form onSubmit={handleCadastro} className="form-container">
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" />
        <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="input" />
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" />
        <input type="text" placeholder="Função" value={funcao} onChange={e => setFuncao(e.target.value)} className="input" />

        <UploadImagem onUploadComplete={url => setFoto(url)} />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="home-button" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
