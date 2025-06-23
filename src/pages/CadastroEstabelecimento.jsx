import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Reutiliza o mesmo estilo visual da plataforma

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
    <div className="home-container">
      <h1 className="home-title">Cadastro de Estabelecimento</h1>

      <form onSubmit={handleSubmit}>
        <label>Nome do Estabelecimento</label>
        <input
          type="text"
          placeholder="Nome do Estabelecimento"
          value={nomeEstabelecimento}
          onChange={(e) => setNomeEstabelecimento(e.target.value)}
          className="input"
          required
        />

        <label>Nome do Responsável</label>
        <input
          type="text"
          placeholder="Nome do Responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className="input"
          required
        />

        <label>E-mail</label>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />

        <label>Telefone</label>
        <input
          type="tel"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="input"
          required
        />

        <label>Endereço</label>
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="input"
          required
        />

        <label>Crie uma Senha</label>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input"
          required
        />

        <button type="submit" className="home-button">
          Cadastrar
        </button>
      </form>
    </div>
  )
}
