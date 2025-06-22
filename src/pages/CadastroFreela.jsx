import React, { useState, useEffect } from 'react'
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
  const [preview, setPreview] = useState(null)
  const [coordenadas, setCoordenadas] = useState({ lat: null, lon: null })

  const navigate = useNavigate()

  useEffect(() => {
    if (foto) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(foto)
    } else {
      setPreview(null)
    }
  }, [foto])

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`)
      const data = await response.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (error) {
      console.error("Erro ao geolocalizar:", error)
    }
    return { lat: null, lon: null }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const coords = await geolocalizarEndereco(endereco)

    const novoUsuario = {
      nome,
      email,
      senha,
      celular,
      endereco,
      funcao,
      tipo: 'freela',
      foto: preview || null,
      coordenadas: coords
    }

    const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const jaExiste = usuariosExistentes.some(u => u.email === email)

    if (jaExiste) {
      alert('Esse e-mail já está cadastrado.')
      return
    }

    localStorage.setItem('usuarios', JSON.stringify([...usuariosExistentes, novoUsuario]))
    alert('Cadastro realizado com sucesso!')
    navigate('/login')
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro de Freelancer</h1>
      <p className="home-description">Preencha seus dados para começar a trabalhar com a gente.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-6">
        <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="input" />
        <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" />
        <input type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} required className="input" />
        <input type="tel" placeholder="Celular com DDD" value={celular} onChange={(e) => setCelular(e.target.value)} required className="input" />
        <input type="text" placeholder="Endereço completo" value={endereco} onChange={(e) => setEndereco(e.target.value)} required className="input" />
        <input type="text" placeholder="Função (ex: garçom, cozinheiro...)" value={funcao} onChange={(e) => setFuncao(e.target.value)} required className="input" />

        <label className="text-gray-700 text-sm">Foto de Perfil:</label>
        <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} className="mb-2" />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover mx-auto shadow"
          />
        )}

        <button type="submit" className="home-button">Cadastrar</button>
        <button type="button" onClick={() => navigate('/')} className="home-button bg-gray-500 hover:bg-gray-600">Voltar</button>
      </form>
    </div>
  )
}
