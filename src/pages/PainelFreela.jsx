// src/pages/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Home.css'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    const carregarVagas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vagas'))
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
        setVagas([])
      }
    }

    carregarVagas()
  }, [navigate])

  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))

  return (
    <div className="min-h-screen bg-blue-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">🎯 Painel do Freelancer</h1>

      <button
        onClick={() => navigate(`/perfil/${usuario?.uid}`)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-6"
      >
        Editar Perfil
      </button>

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
