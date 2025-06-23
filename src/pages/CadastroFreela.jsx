import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState(null)

  const navigate = useNavigate()

  const handleFotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      alert('Imagem muito grande. Envie uma com até 1MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ml_default')
    formData.append('cloud_name', 'dbemvuau3')

    const res = await fetch('https://api.cloudinary.com/v1_1/dbemvuau3/image/upload', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    setFoto(data.secure_url)
  }

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`)
      const data = await res.json()
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        }
      }
    } catch (error) {
      console.error('Erro ao geolocalizar:', error)
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const coordenadas = await geolocalizarEndereco(endereco)
    if (!coordenadas) {
      alert('Não foi possível localizar o endereço. Tente escrever de forma mais completa.')
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

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    usuarios.push(novoFreela)
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
    localStorage.setItem('usuarioLogado', JSON.stringify(novoFreela))

    alert('Cadastro realizado com sucesso!')
    navigate('/painel')
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro Freelancer</h1>

      <form onSubmit={handleSubmit}>
        <label>Nome completo</label>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="input"
          required
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input"
          required
        />

        <label>Senha</label>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="input"
          required
        />

        <label>Celular</label>
        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
          className="input"
          required
        />

        <label>Endereço</label>
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="input"
          required
        />

        <label>Função (ex: Cozinheiro, Garçom)</label>
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          className="input"
          required
        />

        <label>Foto de Perfil</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
        />
        {foto && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <img
              src={foto}
              alt="Preview da foto"
              className="w-24 h-24 rounded-full object-cover border-2 border-orange-500 mx-auto"
            />
            <p className="text-sm text-gray-600 mt-1">Pré-visualização da sua foto</p>
          </div>
        )}

        <button type="submit" className="home-button">
          Cadastrar
        </button>
      </form>
    </div>
  )
}
