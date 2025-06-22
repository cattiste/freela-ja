import React, { useState } from 'react'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [funcao, setFuncao] = useState('')
  const [imagemPreview, setImagemPreview] = useState(null)

  const handleImagem = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagemPreview(url)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aqui você pode adicionar lógica de envio para API
    alert('Cadastro enviado com sucesso!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Cadastro de Freelancer</h2>

        <div className="flex flex-col items-center space-y-2">
          {imagemPreview && (
            <img
              src={imagemPreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-full border border-gray-300 shadow-md"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImagem}
            className="text-sm text-gray-600"
          />
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Função (ex: Cozinheiro, Garçom...)"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Cadastrar
        </button>
      </form>
    </div>
  )
}
