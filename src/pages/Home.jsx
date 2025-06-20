import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <h1 className="home-title">Bem-vindo ao ChefJá</h1>
      <p className="home-description">Conectando Chefs e Restaurantes em uma plataforma simples, direta e eficiente.</p>

      <div className="home-buttons">
        <button onClick={() => navigate('/cadastro')}>Sou um Freela</button>
        <button onClick={() => navigate('/cadastro')}>Sou um Restaurante</button>
        <button onClick={() => navigate('/login')}>Já tenho conta</button>
        <button onClick={() => navigate('/contratar')}>Quero contratar um Chef</button>
      </div>
    </div>
  )
}
