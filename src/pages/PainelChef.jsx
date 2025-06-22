import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Alarme simulado
import alarme from '../assets/alarme.mp3'
// Fallback se não tiver imagem
import defaultAvatar from '../assets/avatar-fallback.png'

export default function PainelChef() {
  const navigate = useNavigate()
  const [imagemFreela, setImagemFreela] = useState(null)
  const [candidaturas, setCandidaturas] = useState([])
  const [vagas, setVagas] = useState([
    { id: 1, titulo: 'Garçom para evento', local: 'São Paulo - SP' },
    { id: 2, titulo: 'Cozinheiro noturno', local: 'Santo André - SP' }
  ])

  useEffect(() => {
    const candidaturasSalvas = JSON.parse(localStorage.getItem('candidaturas')) || []
    setCandidaturas(candidaturasSalvas)
  }, [])

  function handleCandidatar(vaga) {
    const novas = [...candidaturas, vaga]
    setCandidaturas(novas)
    localStorage.setItem('candidaturas', JSON.stringify(novas))
  }

  function tocarAlarme() {
    const audio = new Audio(alarme)
    audio.play()
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Painel do Freelancer</h1>

      {/* Imagem com fallback */}
      <div className="flex justify-center mb-4">
        <img
          src={imagemFreela || defaultAvatar}
          alt="Foto do Freelancer"
          className="w-40 h-40 object-cover rounded-full shadow-lg border"
          onError={(e) => (e.target.src = defaultAvatar)}
        />
      </div>

      {/* Dados básicos */}
      <div className="mb-4">
        <p><strong>Nome:</strong> João Silva</p>
        <p><strong>Função:</strong> Cozinheiro</p>
        <p><strong>Email:</strong> joao@email.com</p>
        <p><strong>Telefone:</strong> (11) 99999-9999</p>
      </div>

      {/* Botões padrão */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <button onClick={() => navigate('/cadastrofreela')} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          Editar Perfil
        </button>
        <button onClick={() => navigate('/')} className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 transition">
          Sair
        </button>
      </div>

      {/* Vagas disponíveis */}
      <h2 className="text-2xl font-semibold mb-4">Vagas Disponíveis</h2>
      <ul className="space-y-3 mb-8">
        {vagas.map((vaga) => (
          <li key={vaga.id} className="border p-4 rounded-lg shadow">
            <p className="font-semibold">{vaga.titulo}</p>
            <p className="text-sm text-gray-600">{vaga.local}</p>
            {!candidaturas.find((v) => v.id === vaga.id) && (
              <button
                onClick={() => handleCandidatar(vaga)}
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
              >
                Candidatar-se
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Minhas candidaturas */}
      <h2 className="text-2xl font-semibold mb-4">Minhas Candidaturas</h2>
      {candidaturas.length === 0 ? (
        <p className="text-gray-500">Nenhuma candidatura ainda.</p>
      ) : (
        <ul className="space-y-3 mb-8">
          {candidaturas.map((vaga, index) => (
            <li key={index} className="border p-4 rounded-lg shadow">
              <p className="font-semibold">{vaga.titulo}</p>
              <p className="text-sm text-gray-600">{vaga.local}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Simular chamado */}
      <button
        onClick={tocarAlarme}
        className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
      >
        Simular Chamado (Alarme)
      </button>
    </div>
  )
}
