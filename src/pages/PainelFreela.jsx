// src/pages/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './Home.css'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [vagas, setVagas] = useState([])

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))

    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    async function carregarFreela() {
      try {
        const docRef = doc(db, 'usuarios', usuario.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setFreela(docSnap.data())
        } else {
          console.error('Usuário não encontrado na base.')
        }
      } catch (err) {
        console.error('Erro ao carregar freela:', err)
      }
    }

    carregarFreela()

    // Simulando vagas carregadas do localStorage
    const vagasDisponiveis = JSON.parse(localStorage.getItem('vagas') || '[]')
    setVagas(vagasDisponiveis)
  }, [navigate])

  if (!freela) {
    return <div className="text-center mt-10 text-blue-600 font-bold">Carregando dados do freelancer...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">🎯 Painel do Freelancer</h1>

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mb-6 text-left">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
            alt="freela"
            className="w-20 h-20 rounded-full object-cover border border-blue-300 shadow-sm"
          />
          <div>
            <p className="text-xl font-bold">{freela.nome}</p>
            <p className="text-blue-700">{freela.funcao}</p>
            <p className="text-gray-600 text-sm">{freela.email}</p>
            <p className="text-gray-600 text-sm">{freela.celular}</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/perfil/${freela.uid}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          ✏️ Editar Perfil
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-blue-700 mb-4">📌 Vagas Disponíveis</h2>
      <div className="max-w-4xl mx-auto">
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
    </div>
  )
}
