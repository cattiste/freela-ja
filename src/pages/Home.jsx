import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <h1 className="home-title">Bem-vindo ao ChefJá</h1>
      <p className="home-description">
        Conectando profissionais e estabelecimentos em uma plataforma simples, direta e eficiente.
      </p>

      <div className="home-buttons">
        <button onClick={() => navigate('/cadastro')}>Sou um Freelancer</button>
        <button onClick={() => navigate('/cadastro')}>Sou um Estabelecimento</button>
        <button onClick={() => navigate('/login')}>Já tenho conta</button>
        <button onClick={() => navigate('/contratar')}>Painel de Profissionais</button>
      </div>
    </div>
  )
}
