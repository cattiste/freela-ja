import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <h1 className="home-title">Bem-vindo ao Freela Já</h1>
      <p className="home-description">
        Conectando profissionais e estabelecimentos em uma plataforma simples, direta e eficiente.
      </p>

      <div className="home-buttons flex flex-col md:flex-row gap-4 justify-center mt-6">
        <button onClick={() => navigate("/cadastro?tipo=freela")}>Sou um Freelancer</button>
        <button onClick={() => navigate("/cadastro?tipo=estabelecimento")}>Sou um Estabelecimento</button>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/contratar')}>Painel de Vagas</button>
      </div>
    </div>
  )
}
