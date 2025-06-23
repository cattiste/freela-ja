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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg space-y-6"
      >
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-2">Cadastro Freelancer</h1>

        {[
          { placeholder: 'Nome completo', value: nome, set: setNome, type: 'text' },
          { placeholder: 'Email', value: email, set: setEmail, type: 'email' },
          { placeholder: 'Senha', value: senha, set: setSenha, type: 'password' },
          { placeholder: 'Celular', value: celular, set: setCelular, type: 'text' },
          { placeholder: 'Endereço', value: endereco, set: setEndereco, type: 'text' },
          { placeholder: 'Função (ex: Cozinheiro, Garçom)', value: funcao, set: setFuncao, type: 'text' }
        ].map((field, idx) => (
          <input
            key={idx}
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            onChange={e => field.set(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500 text-slate-800"
          />
        ))}

        <div className="flex flex-col space-y-2">
          <label className="text-slate-700 font-medium">Foto de Perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-sm text-slate-600"
          />
          {foto && (
            <img
              src={foto}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-400 mx-auto mt-2"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition duration-200"
        >
          Cadastrar
        </button>
      </form>
    </div>
  )
}
