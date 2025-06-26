import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import UploadImagem from '../components/UploadImagem'

export default function CadastroEstabelecimento() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
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

    if (!nome || !email || !senha || !celular || !endereco) {
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
        foto,
        tipo: 'estabelecimento',
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
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro de Estabelecimento</h1>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome do Estabelecimento"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="input-field"
          required
        />

        <UploadImagem onUploadComplete={url => setFoto(url)} />

        {error && <p className="text-red-600 text-center mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-4"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
