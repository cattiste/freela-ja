// src/pages/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AgendaFreela from '../components/AgendaFreela'

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
      <div className="max-w-7xl mx-auto">
        {/* CABEÇALHO */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">
            🎯 Painel do Freelancer
          </h1>
          {freela && (
            <p className="text-gray-600 mt-2">
              Bem-vindo(a), <span className="font-semibold text-blue-600">{freela.nome}</span>
            </p>
          )}
        </header>

        {/* SEÇÃO PRINCIPAL - PERFIL E AGENDA */}
        {freela && (
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            {/* PERFIL DO FREELA */}
            <div className="flex-1 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <img
                  src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                  alt="freela"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{freela.nome}</h2>
                  <p className="text-blue-600">{freela.funcao}</p>
                  <p className="text-gray-500 text-sm">{freela.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <button
                  onClick={() => navigate(`/editarfreela/${freela.uid}`)}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-2 px-5 rounded-full shadow-md"
                >
                  ✏️ Editar Perfil
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-semibold py-2 px-5 rounded-full shadow-md">
                  📊 Ver Estatísticas
                </button>
              </div>

              {/* INFORMAÇÕES ADICIONAIS (OPCIONAL) */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-700 mb-2">📌 Habilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {freela.habilidades?.length > 0 ? (
                    freela.habilidades.map((hab, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        {hab}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma habilidade cadastrada</p>
                  )}
                </div>
              </div>
            </div>

            {/* AGENDA */}
            <div className="flex-1 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <span>📅</span>
                <span>Agenda de Disponibilidade</span>
              </h2>
              <AgendaFreela uid={freela.uid} />
            </div>
          </div>
        )}

        {/* VAGAS DISPONÍVEIS */}
        <section className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
            <span>📌</span>
            <span>Vagas Disponíveis</span>
          </h2>

          {vagas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600">🔎 Nenhuma vaga disponível no momento.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition"
              >
                Atualizar vagas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vagas.map((vaga, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition flex flex-col h-full"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{vaga.titulo}</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <p><strong>🏢 Empresa:</strong> {vaga.empresa}</p>
                    <p><strong>📍 Local:</strong> {vaga.cidade}</p>
                    <p><strong>📄 Tipo:</strong> {vaga.tipo}</p>
                    <p><strong>💰 Salário:</strong> {vaga.salario}</p>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm flex-grow">{vaga.descricao}</p>

                  <div className="flex flex-wrap gap-3 mt-auto">
                    <a
                      href={`mailto:${vaga.emailContato}?subject=Candidatura para vaga: ${vaga.titulo}`}
                      className="bg-green-600 hover:bg-green-700 transition text-white font-semibold py-2 px-4 rounded-full shadow-md text-sm"
                    >
                      ✅ Candidatar-se
                    </a>
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-full shadow-md text-sm">
                      ℹ️ Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* BOTÃO FLUTUANTE */}
      <button
        onClick={() => navigate('/sobre')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full shadow-lg z-50 flex items-center justify-center"
        aria-label="Sobre"
      >
        ℹ️
      </button>
    </div>
  )
}