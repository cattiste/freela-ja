import React, { useState } from 'react'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [tipo, setTipo] = useState('freela') // freela ou estabelecimento

  const handleSubmit = (e) => {
    e.preventDefault()

    const novoUsuario = { nome, email, senha, tipo }

    // Pega usuários existentes
    const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios') || '[]')

    // Verifica se já existe e-mail igual
    const jaExiste = usuariosExistentes.some(u => u.email === email)
    if (jaExiste) {
      alert('Esse e-mail já está cadastrado.')
      return
    }

    // Salva no localStorage
    const atualizados = [...usuariosExistentes, novoUsuario]
    localStorage.setItem('usuarios', JSON.stringify(atualizados))

    alert('Cadastro realizado com sucesso!')
    setNome('')
    setEmail('')
    setSenha('')
    setTipo('freela')
  }

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 bg-orange-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="px-4 py-3 border rounded" />
        <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className="px-4 py-3 border rounded" />
        <input type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} required className="px-4 py-3 border rounded" />

        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-4 py-3 border rounded" required>
          <option value="freela">Sou um Profissional</option>
          <option value="estabelecimento">Sou um Estabelecimento</option>
        </select>

        <button type="submit" className="bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-700">Cadastrar</button>
      </form>
    </div>
  )
}
