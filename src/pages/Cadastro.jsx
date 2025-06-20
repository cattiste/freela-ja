import React, { useState } from 'react'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const novoUsuario = { nome, email, senha }

    const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const atualizados = [...usuariosExistentes, novoUsuario]
    localStorage.setItem('usuarios', JSON.stringify(atualizados))

    alert('Cadastro enviado com sucesso!')
    setNome('')
    setEmail('')
    setSenha('')
  }

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 bg-orange-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cadastro de Freela</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        <input
          type="password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        <button
          type="submit"
          className="px-4 py-3 bg-orange-600 text-white font-bold rounded-md hover:bg-orange-700 transition"
        >
          Cadastrar
        </button>
      </form>
    </div>
  )
}
