import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function CadastroFreela() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleImagem = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFoto(reader.result)
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const novoFreela = {
      nome,
      email,
      celular,
      endereco,
      funcao,
      tipo: 'freela',
      foto
    }

    const cadastrados = JSON.parse(localStorage.getItem('usuarios') || '[]')

    const jaExiste = cadastrados.some(u => u.email === email)
    if (jaExiste) {
      alert('Esse e-mail já está cadastrado.')
      return
    }

    localStorage.setItem('usuarios', JSON.stringify([...cadastrados, novoFreela]))
    alert('Cadastro realizado com sucesso!')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-orange-200 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center text-orange-600 mb-4">Cadastro de Freelancer</h1>
        <p className="text-center text-gray-600 mb-6">
          Preencha seus dados para se cadastrar como profissional.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-full border-2 border-orange-600" />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImagem}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="px-4 py-3 border rounded"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 border rounded"
          />
          <input
            type="tel"
            placeholder="Celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            required
            className="px-4 py-3 border rounded"
          />
          <input
            type="text"
            placeholder="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
            className="px-4 py-3 border rounded"
          />
          <input
            type="text"
            placeholder="Função (ex: Cozinheiro, Garçom...)"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            required
            className="px-4 py-3 border rounded"
          />

          <button
            type="submit"
            className="bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-700"
          >
            Cadastrar
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-2 text-orange-600 underline hover:text-orange-800 text-sm text-center"
          >
            Voltar à página inicial
          </button>
        </form>
      </div>
    </div>
  )
}
