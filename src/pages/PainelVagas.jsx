// src/pages/PainelVagas.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PainelVagas() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchVagas() {
      setLoading(true)
      setError(null)
      try {
        const vagasRef = collection(db, 'vagas')
        // Atenção: 'clt' está em minúsculo, ajustar conforme salvo no banco
        const q = query(vagasRef, where('tipoVaga', '==', 'clt'), where('status', '==', 'ativo'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (err) {
        console.error('Erro ao buscar vagas:', err)
        setError('Erro ao carregar vagas. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchVagas()
  }, [])

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex justify-between max-w-md w-full px-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded px-4 py-2 shadow"
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 shadow"
        >
          🏠 Home
        </button>
      </div>

      <div className="min-h-screen bg-gray-50 p-6 pt-24 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Painel de Vagas CLT</h2>
        <p className="mb-6 text-gray-600">Confira vagas fixas publicadas por estabelecimentos</p>

        {loading && <p className="text-center text-gray-500">Carregando vagas...</p>}

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        {!loading && vagas.length === 0 && (
          <p className="text-center text-gray-500">Nenhuma vaga disponível no momento.</p>
        )}

        {!loading && vagas.length > 0 && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {vagas.map(vaga => (
              <div
                key={vaga.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition cursor-pointer flex flex-col"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{vaga.titulo}</h3>
                <p className="text-gray-700 mb-1"><strong>Empresa:</strong> {vaga.empresa}</p>
                <p className="text-gray-700 mb-1"><strong>Cidade:</strong> {vaga.cidade}</p>
                <p className="text-gray-700 mb-1"><strong>Tipo:</strong> {vaga.tipoVaga || 'Não informado'}</p>
                <p className="text-gray-700 mb-3">
                  <strong>Salário:</strong>{' '}
                  {vaga.salario
                    ? `R$ ${Number(vaga.salario).toFixed(2).replace('.', ',')}`
                    : 'Não informado'}
                </p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{vaga.descricao}</p>
                <a
                  href={`mailto:${vaga.emailContato}?subject=Candidatura para vaga: ${encodeURIComponent(vaga.titulo)}`}
                  className="mt-auto inline-block bg-green-600 hover:bg-green-700 text-white font-semibold rounded px-4 py-2 text-center transition"
                >
                  Candidatar-se
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
