import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroEstabelecimento() {
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [senha, setSenha] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    const novoEstabelecimento = {
      nome: nomeEstabelecimento,
      responsavel,
      email,
      telefone,
      endereco,
      senha,
      tipo: 'estabelecimento'
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

    const jaExiste = usuarios.some(u => u.email === email)
    if (jaExiste) {
      alert('Este e-mail já está cadastrado.')
      return
    }

    const atualizados = [...usuarios, novoEstabelecimento]
    localStorage.setItem('usuarios', JSON.stringify(atualizados))

    alert('Cadastro realizado com sucesso!')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-orange-700 mb-6">Cadastro de Estabelecimento</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Nome do Estabelecimento" value={nomeEstabelecimento} onChange={(e) => setNomeEstabelecimento(e.target.value)} required className="px-4 py-3 border rounded" />
          <input type="text" placeholder="Nome do Responsável" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required className="px-4 py-3 border rounded" />
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className="px-4 py-3 border rounded" />
          <input type="tel" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required className="px-4 py-3 border rounded" />
          <input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required className="px-4 py-3 border rounded" />
          <input type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} required className="px-4 py-3 border rounded" />

          <button type="submit" className="bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-700 transition">Cadastrar</button>
        </form>
      </div>
    </div>
  )
}
