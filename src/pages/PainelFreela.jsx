// src/pages/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AgendaFreela from '../components/AgendaFreela'
import './Home.css'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])
  const [freela, setFreela] = useState(null)

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    // Recupera o freela logado com os dados completos
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const freelaLogado = usuarios.find(u => u.uid === usuario.uid)

    if (!freelaLogado) {
      alert('Freelancer não encontrado.')
      navigate('/login')
      return
    }

    setFreela(freelaLogado)

    // Busca vagas
    const vagasDisponiveis = JSON.parse(localStorage.getItem('vagas') || '[]')
    setVagas(vagasDisponiveis)
  }, [navigate])

  return (
    <div className="min-h-screen bg-blue-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">🎯 Painel do Freelancer</h1>

      {freela && (
        <div className="max-w-2xl mx-auto mb-6 bg-white rounded-lg p-6 shadow text-left">
          <div className="flex items-center mb-4 gap-4">
            <img
              src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
              alt="freela"
              className="w-16 h-16 rounded-full object-cover border border-blue-300 shadow-sm"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{freela.nome}</h2>
              <p className="text-gray-600">{freela.funcao}</p>
              <p className="text-gray-500 text-sm">{freela.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/perfil/${freela.uid}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Editar Perfil
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">📌 Vagas Disponíveis</h2>
        {vagas.length === 0 ? (
          <p className="text-gray-600">🔎 Nenhuma vaga disponível no momento.</p>
        ) : (
          vagas.map((vaga, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-4 mb-4 text-left">
              <h2 className="text-xl font-bold text-gray-800">{vaga.titulo}</h2>
              <p><strong>Empresa:</strong> {vaga.empresa}</p>
              <p><strong>Cidade:</strong> {vaga.cidade}</p>
              <p><strong>Tipo:</strong> {vaga.tipo}</p>
              <p><strong>Salário:</strong> {vaga.salario}</p>
              <p className="text-sm text-gray-600 mt-2">{vaga.descricao}</p>
              <a
                href={`mailto:${vaga.emailContato}?subject=Candidatura para vaga: ${vaga.titulo}`}
                className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
              >
                Candidatar-se
              </a>
            </div>
          ))
        )}
      </div>

      {freela?.uid && <AgendaFreela uid={freela.uid} />}
    </div>
  )
}
