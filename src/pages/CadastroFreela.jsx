// src/pages/CadastroFreela.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroFreela() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [funcao, setFuncao] = useState('')
  const [endereco, setEndereco] = useState('')
  const [imagem, setImagem] = useState(null)

  const handleImagemChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagem(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSalvar = () => {
    localStorage.setItem('nomeFreela', nome)
    localStorage.setItem('emailFreela', email)
    localStorage.setItem('telefoneFreela', telefone)
    localStorage.setItem('funcaoFreela', funcao)
    localStorage.setItem('enderecoFreela', endereco)
    if (imagem) {
      localStorage.setItem('imagemFreela', imagem)
    }
    navigate('/painel')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Cadastro do Freelancer</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Função (ex: Cozinheiro)"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Endereço completo"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImagemChange}
            className="w-full px-4 py-2 text-gray-700"
          />
        </div>

        <button
          onClick={handleSalvar}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
        >
          Salvar Cadastro
        </button>
      </div>
    </div>
  )
}
