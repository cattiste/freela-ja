import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg space-y-5"
      >
        <h1 className="text-3xl font-bold text-center text-slate-800">Cadastro Freelancer</h1>

        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          placeholder="Função (ex: Cozinheiro, Garçom)"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex flex-col space-y-2">
          <label className="text-slate-700 font-medium">Foto de Perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="w-full px-4 py-2 border rounded-xl bg-slate-50"
          />
          {foto && <img src={foto} alt="Preview" className="w-24 h-24 rounded-full object-cover border mx-auto mt-2" />}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition"
        >
          Cadastrar
        </button>
      </form>
    </div>
  )
}
