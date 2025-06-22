import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState(null)

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    const novoUsuario = {
      nome,
      email,
      senha,
      celular,
      endereco,
      funcao,
      tipo: 'freela',
      foto: foto ? URL.createObjectURL(foto) : null
    }

    const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const jaExiste = usuariosExistentes.some(u => u.email === email)
    if (jaExiste) {
      alert('Esse e-mail já está cadastrado.')
      return
    }

    const atualizados = [...usuariosExistentes, novoUsuario]
    localStorage.setItem('usuarios', JSON.stringify(atualizados))

    alert('Cadastro realizado com sucesso!')
    navigate('/login')
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro de Freelancer</h1>
      <p className="home-description">Preencha seus dados para começar a trabalhar com a gente.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-6">
        <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="input" />
        <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" />
        <input type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} required className="input" />
        <input type="tel" placeholder="Celular com DDD" value={celular} onChange={(e) => setCelular(e.target.value)} required className="input" />
        <input type="text" placeholder="Endereço completo" value={endereco} onChange={(e) => setEndereco(e.target.value)} required className="input" />
        <input type="text" placeholder="Função (ex: garçom, cozinheiro...)" value={funcao} onChange={(e) => setFuncao(e.target.value)} required className="input" />

        <label className="text-gray-700 text-sm">Foto de Perfil:</label>
        <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} className="mb-4" />

        <button type="submit" className="home-button">Cadastrar</button>
        <button type="button" onClick={() => navigate('/')} className="home-button bg-gray-500 hover:bg-gray-600">Voltar</button>
      </form>
    </div>
  )
}
