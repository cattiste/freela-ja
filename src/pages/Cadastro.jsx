import React, { useState } from 'react'

export default function Cadastro() {
  const [tipo, setTipo] = useState('freela')

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 px-4 pt-10">
      <h2 className="text-3xl font-bold text-orange-700 mb-6 text-center">
        Cadastro {tipo === 'freela' ? 'Profissional' : 'Estabelecimento'}
      </h2>

      <div className="mb-6">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="freela">Sou um Profissional</option>
          <option value="estabelecimento">Sou um Estabelecimento</option>
        </select>
      </div>

      {tipo === 'freela' ? <FormFreela /> : <FormEstabelecimento />}
    </div>
  )
}

// ⬇️ FORMULÁRIO DO FREELA
function FormFreela() {
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    celular: '',
    endereco: '',
    funcao: '',
    senha: '',
    tipo: 'freela'
  })

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    if (usuarios.some(u => u.email === dados.email)) {
      alert('E-mail já cadastrado!')
      return
    }

    localStorage.setItem('usuarios', JSON.stringify([...usuarios, dados]))
    alert('Cadastro realizado com sucesso!')
    setDados({ nome: '', email: '', celular: '', endereco: '', funcao: '', senha: '', tipo: 'freela' })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
      <input name="nome" placeholder="Nome completo" value={dados.nome} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="email" type="email" placeholder="E-mail" value={dados.email} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="celular" placeholder="Celular" value={dados.celular} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="endereco" placeholder="Endereço completo" value={dados.endereco} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="funcao" placeholder="Função (ex: cozinheiro, garçom...)" value={dados.funcao} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="senha" type="password" placeholder="Senha" value={dados.senha} onChange={handleChange} required className="px-4 py-2 border rounded" />

      <button type="submit" className="bg-orange-600 text-white font-bold py-2 rounded hover:bg-orange-700">
        Cadastrar
      </button>
    </form>
  )
}

// ⬇️ FORMULÁRIO DO ESTABELECIMENTO
function FormEstabelecimento() {
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    senha: '',
    tipo: 'estabelecimento'
  })

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    if (usuarios.some(u => u.email === dados.email)) {
      alert('E-mail já cadastrado!')
      return
    }

    localStorage.setItem('usuarios', JSON.stringify([...usuarios, dados]))
    alert('Cadastro realizado com sucesso!')
    setDados({ nome: '', email: '', telefone: '', endereco: '', senha: '', tipo: 'estabelecimento' })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
      <input name="nome" placeholder="Nome do estabelecimento" value={dados.nome} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="email" type="email" placeholder="E-mail" value={dados.email} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="telefone" placeholder="Telefone comercial" value={dados.telefone} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="endereco" placeholder="Endereço completo" value={dados.endereco} onChange={handleChange} required className="px-4 py-2 border rounded" />
      <input name="senha" type="password" placeholder="Senha" value={dados.senha} onChange={handleChange} required className="px-4 py-2 border rounded" />

      <button type="submit" className="bg-orange-600 text-white font-bold py-2 rounded hover:bg-orange-700">
        Cadastrar
      </button>
    </form>
  )
}
