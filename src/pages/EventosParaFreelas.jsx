// src/pages/EventosParaFreelas.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

export default function EventosParaFreelas() {
  const navigate = useNavigate()
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEventos() {
      try {
        const eventosRef = collection(db, 'eventos')
        const q = query(eventosRef, where('status', '==', 'ativo'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setEventos(lista)
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
        setError('Erro ao carregar eventos.')
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [])

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex justify-between max-w-md w-full px-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded px-4 py-2 shadow"
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          aria-label="Home"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 shadow"
        >
          🏠 Home
        </button>
      </div>

      <div className="min-h-screen bg-gray-50 p-6 pt-24 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-orange-700 text-center">Eventos para Freelancers</h2>

        {loading && <p className="text-center text-gray-600">Carregando eventos...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && eventos.length === 0 && (
          <p className="text-center text-gray-500">Nenhum evento disponível no momento.</p>
        )}

        <ul className="space-y-6 max-w-4xl mx-auto">
          {eventos.map(evento => (
            <li
              key={evento.id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2">{evento.titulo}</h3>
              <p className="text-gray-700 mb-2">{evento.descricao}</p>
              <p><strong>Data:</strong> {new Date(evento.dataEvento).toLocaleDateString()}</p>
              <p><strong>Cidade:</strong> {evento.cidade}</p>
              <a
                href={`mailto:${evento.contato}?subject=Interesse no evento: ${encodeURIComponent(evento.titulo)}`}
                className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded px-4 py-2 transition"
              >
                Entrar em contato
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
