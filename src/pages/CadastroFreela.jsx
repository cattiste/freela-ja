import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroFreela() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState('')
  const [coordenadas, setCoordenadas] = useState({ lat: null, lon: null })

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`)
      const data = await response.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      } else {
        return { lat: null, lon: null }
      }
    } catch (error) {
      console.error('Erro na geolocalização:', error)
      return { lat: null, lon: null }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const coords = await geolocalizarEndereco(endereco)
    setCoordenadas(coords)

    const novoFreela = {
      nome,
      email,
      senha,
      celular,
      endereco,
      funcao,
      foto,
      tipo: 'freela',
      coordenadas: coords
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    usuarios.push(novoFreela)
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
    localStorage.setItem('usuarioLogado', JSON.stringify(novoFreela))

    alert('Cadastro realizado com sucesso!')
    navigate('/painel')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-slate-700">Cadastro de Freelancer</h2>

        <input type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Endereço completo" value={endereco} onChange={e => setEndereco(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Função (ex: Cozinheiro, Garçom...)" value={funcao} onChange={e => setFuncao(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="url" placeholder="URL da foto de perfil (opcional)" value={foto} onChange={e => setFoto(e.target.value)} className="w-full p-2 border rounded" />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Cadastrar</button>
      </form>
    </div>
  )
}
