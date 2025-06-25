// src/pages/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AgendaFreela from '../components/AgendaFreela'
// ❌ Remova essa linha:
// import './Home.css'

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

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const freelaLogado = usuarios.find(u => u.uid === usuario.uid)

    if (!freelaLogado) {
      alert('Freelancer não encontrado.')
      navigate('/login')
      return
    }

    setFreela(freelaLogado)

    const vagasDisponiveis = JSON.parse(localStorage.getItem('vagas') || '[]')
    setVagas(vagasDisponiveis)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 text-center mb-8">
        🎯 Painel do Freelancer
      </h1>

      {freela && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-md mb-8 transition hover:shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
              alt="freela"
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 shadow"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{freela.nome}</h2>
              <p className="text-blue-600">{freela.funcao}</p>
              <p className="text-gray-500 text-sm">{freela.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/perfil/${freela.uid}`)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white font-semibold py-2 px-5 rounded-full shadow-md"
          >
            ✏️ Editar Perfil
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">📌 Vagas Disponíveis</h2>

        {vagas.length === 0 ? (
          <p className="text-gray-600 text-center">🔎 Nenhuma vaga disponível no momento.</p>
        ) : (
          <div className="grid gap-6">
            {vagas.map((vaga, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{vaga.titulo}</h3>
                <p><strong>🏢 Empresa:</strong> {vaga.empresa}</p>
                <p><strong>📍 Cidade:</strong> {vaga.cidade}</p>
                <p><strong>📄 Tipo:</strong> {vaga.tipo}</p>
                <p><strong>💰 Salário:</strong> {vaga.salario}</p>
                <p className="text-gray-600 mt-2 text-sm">{vaga.descricao}</p>

                <a
                  href={`mailto:${vaga.emailContato}?subject=Candidatura para vaga: ${vaga.titulo}`}
                  className="mt-4 inline-block bg-green-600 hover:bg-green-700 transition text-white font-semibold py-2 px-5 rounded-full shadow-md"
                >
                  ✅ Candidatar-se
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {freela?.uid && (
        <div className="max-w-4xl mx-auto mt-12">
          <AgendaFreela uid={freela.uid} />
        </div>
      )}

      {/* Botão Sobre flutuante (opcional) */}
      <button
        onClick={() => navigate('/sobre')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg z-50"
      >
        ℹ️ Sobre
      </button>
    </div>
  )
}
