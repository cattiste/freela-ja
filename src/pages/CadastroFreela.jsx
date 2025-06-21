import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CadastroFreela.css'

export default function CadastroFreela() {
  const navigate = useNavigate()
  const [foto, setFoto] = useState(null)

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // aqui você envia os dados, por enquanto só um log:
    console.log('Cadastro enviado')
  }

  return (
    <div className="cadastro-container">
      <h1 className="cadastro-title">Cadastro de Freelancer</h1>
      <p className="cadastro-description">Preencha seus dados para se cadastrar como profissional.</p>

      <form onSubmit={handleSubmit} className="cadastro-form">
        <input type="file" accept="image/*" onChange={handleFotoChange} className="cadastro-input" />
        <input type="text" placeholder="Nome completo" className="cadastro-input" />
        <input type="email" placeholder="E-mail" className="cadastro-input" />
        <input type="tel" placeholder="Celular" className="cadastro-input" />
        <input type="text" placeholder="Endereço" className="cadastro-input" />
        <input type="text" placeholder="Função (ex: Cozinheiro, Garçom...)" className="cadastro-input" />

        <button type="submit" className="cadastro-button">Cadastrar</button>
        <button type="button" onClick={() => navigate('/')} className="cadastro-voltar">
          Voltar à página inicial
        </button>
      </form>
    </div>
  )
}
