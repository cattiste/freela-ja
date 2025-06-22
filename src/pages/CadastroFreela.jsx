import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CadastroFreela.css'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl space-y-6">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-4">Cadastro do Freelancer</h2>

        <input type="text" placeholder="Nome completo"
          value={nome} onChange={e => setNome(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 outline-none text-lg"
        />
        <input type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 outline-none text-lg"
        />
        <input type="password" placeholder="Senha"
          value={senha} onChange={e => setSenha(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 outline-none text-lg"
        />
        <input type="text" placeholder="Celular"
          value={celular} onChange={e => setCelular(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 outline-none text-lg"
        />
        <input type="text" placeholder="Endereço"
          value={endereco} onChange={e => setEndereco(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 outline-none text-lg"
        />
        <input type="text" placeholder="Função"
          value={funcao} onChange={e => setFuncao(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 outline-none text-lg"
        />

        <div>
          <label className="block text-slate-700 font-medium mb-2">Foto de Perfil</label>
          <input type="file" accept="image/*" onChange={handleUploadImagem}
            className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-slate-50"
          />
          {preview && (
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-500">Tamanho: {tamanhoImagem}</p>
              <img src={preview} alt="Preview" className="w-28 h-28 rounded-full object-cover border-4 mx-auto mt-2 border-slate-300" />
            </div>
          )}
        </div>

        <button type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-md text-lg">
          Finalizar Cadastro
        </button>
      </form>
    </div>
  )
}
