// src/pages/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import somAlarme from '../assets/alarme.mp3' // você pode adicionar esse som

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [chamado, setChamado] = useState(false)

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    setFreela(usuario)

    const chamadoAtual = localStorage.getItem('freelaChamado')
    if (chamadoAtual && chamadoAtual === usuario.nome) {
      setChamado(true)
      const audio = new Audio(somAlarme)
      audio.play()
    }
  }, [navigate])

  const handleSair = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const handleAceitar = () => {
    alert('Você aceitou o chamado!')
    localStorage.removeItem('freelaChamado')
    setChamado(false)
  }

  const handleRecusar = () => {
    alert('Você recusou o chamado.')
    localStorage.removeItem('freelaChamado')
    setChamado(false)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Painel do Freelancer</h1>

      {freela && (
        <div className="bg-white shadow-md p-4 rounded-lg mb-4">
          <img src={freela.foto || 'https://via.placeholder.com/100'} alt="foto" className="w-24 h-24 rounded-full mb-2" />
          <p><strong>Nome:</strong> {freela.nome}</p>
          <p><strong>Função:</strong> {freela.funcao}</p>
          <p><strong>Email:</strong> {freela.email}</p>
          <p><strong>Celular:</strong> {freela.celular}</p>

          <div className="mt-4 flex gap-4">
            <button onClick={() => alert('Funcionalidade futura')} className="bg-yellow-500 text-white px-4 py-2 rounded">Editar Perfil</button>
            <button onClick={handleSair} className="bg-red-500 text-white px-4 py-2 rounded">Sair</button>
          </div>
        </div>
      )}

      {chamado && (
        <div className="bg-red-100 border border-red-400 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">🚨 Você foi chamado!</h2>
          <p>Um estabelecimento solicitou seus serviços. Deseja aceitar?</p>
          <div className="flex gap-4 mt-2">
            <button onClick={handleAceitar} className="bg-green-600 text-white px-4 py-2 rounded">Aceitar</button>
            <button onClick={handleRecusar} className="bg-gray-500 text-white px-4 py-2 rounded">Recusar</button>
          </div>
        </div>
      )}
    </div>
  )
}
