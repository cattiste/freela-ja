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
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [tamanhoImagem, setTamanhoImagem] = useState(null)

  const handleUploadImagem = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      alert('Imagem muito grande. Envie uma com até 1MB.')
      return
    }

    setPreview(URL.createObjectURL(file))
    setTamanhoImagem(`${(file.size / 1024).toFixed(1)} KB`)

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

    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
      alert('Preencha todos os campos')
      return
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

    const novoUsuario = {
      nome,
      email,
      senha,
      celular,
      endereco,
      funcao,
      foto,
      tipo: 'freela'
    }

    usuarios.push(novoUsuario)
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
    localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario))

    alert('Cadastro realizado com sucesso!')
    navigate('/painel')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-slate-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 space-y-6 border border-slate-200"
      >
        <h2 className="text-4xl font-bold text-slate-800 text-center mb-6">Cadastro do Freelancer</h2>

        {preview && (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Preview"
              className="w-28 h-28 object-cover rounded-full border-4 border-blue-400 shadow-md"
            />
            <p className="text-sm text-slate-600 mt-1">Tamanho: {tamanhoImagem}</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleUploadImagem}
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-4 text-lg border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 text-lg border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-4 text-lg border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className="w-full p-4 text-lg border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full p-4 text-lg border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          className="w-full p-4 text-lg border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-xl shadow-md transition-all"
        >
          Finalizar Cadastro
        </button>
      </form>
    </div>
  )
}
