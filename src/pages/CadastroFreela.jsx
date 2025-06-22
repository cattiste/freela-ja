import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroFreela() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [funcao, setFuncao] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [imagemBase64, setImagemBase64] = useState(null)

  const handleImagem = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagemBase64(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const dadosFreela = {
      nome,
      funcao,
      email,
      telefone,
      endereco,
      imagem: imagemBase64
    }

    localStorage.setItem('freela', JSON.stringify(dadosFreela))
    navigate('/painel')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Cadastro de Freelancer</h2>

        <label className="block text-gray-700 mb-2">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm"
          required
        />

        <label className="block text-gray-700 mb-2">Função</label>
        <input
          type="text"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm"
          required
        />

        <label className="block text-gray-700 mb-2">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm"
          required
        />

        <label className="block text-gray-700 mb-2">Telefone</label>
        <input
          type="text"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm"
          required
        />

        <label className="block text-gray-700 mb-2">Endereço Completo</label>
        <input
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded shadow-sm"
          required
        />

        <label className="block text-gray-700 mb-2">Foto de Perfil</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImagem}
          className="w-full px-4 py-2 mb-6"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Finalizar Cadastro
        </button>
      </form>
    </div>
  )
}
