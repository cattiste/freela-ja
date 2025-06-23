import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Importa os estilos visuais

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

  const handleSubmit = (e) => {
    e.preventDefault()

    const novoFreela = {
      nome, email, senha, celular, endereco, funcao, foto,
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
          <img
            src={foto}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-orange-500 mx-auto mt-2"
          />
          <p className="text-sm text-gray-600 mt-1">Pré-visualização da sua foto</p>
        )}

        <button type="submit" className="home-button">
          Cadastrar
        </button>
      </form>
    </div>
  )
}
