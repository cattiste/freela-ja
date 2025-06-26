import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function PainelVagas() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])

  useEffect(() => {
    const fetchVagas = async () => {
      const querySnapshot = await getDocs(collection(db, 'vagas'))
      const lista = []
      querySnapshot.forEach(doc => {
        lista.push({ id: doc.id, ...doc.data() })
      })
      setVagas(lista)
    }
    fetchVagas()
  }, [])

  return (
    <div className="min-h-screen bg-orange-50 py-12 px-6">
      {/* Botões de navegação fixos no topo */}
      <div className="w-full max-w-md flex justify-between fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded shadow"
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
        >
          🏠 Home
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-24 text-center">
        <h1 className="text-3xl font-bold text-orange-700 mb-8">📢 Vagas Publicadas</h1>

        {vagas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vagas.map(vaga => (
              <div
                key={vaga.id}
                className="bg-white rounded-xl shadow-md p-6 text-left border-l-4 border-orange-500"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-2">{vaga.titulo}</h2>
                <p><strong>🏢 Empresa:</strong> {vaga.empresa}</p>
                <p><strong>📍 Cidade:</strong> {vaga.cidade}</p>
                <p><strong>💰 Salário:</strong> {vaga.salario}</p>
                <p><strong>📄 Tipo:</strong> {vaga.tipo}</p>
                <p><strong>✉️ Contato:</strong> {vaga.emailContato}</p>
                <p className="text-sm text-gray-600 mt-3">{vaga.descricao}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">🔎 Nenhuma vaga publicada ainda.</p>
        )}
      </div>
    </div>
  )
}
