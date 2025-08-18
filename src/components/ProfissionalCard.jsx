// src/components/ProfissionalCard.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import { FaStar, FaRegStar } from 'react-icons/fa'

export default function ProfissionalCard({ freela, onClose, isOnline }) {
  const [avaliacoes, setAvaliacoes] = useState([])

  useEffect(() => {
    async function loadAvaliacoes() {
      if (!freela?.id && !freela?.uid) return
      const q = query(
        collection(db, 'avaliacoes'),
        where('avaliadoId', '==', freela.uid || freela.id),
        where('tipo', '==', 'freela'),
        orderBy('criadoEm', 'desc'),
        limit(3)
      )
      const snap = await getDocs(q)
      const lista = []
      snap.forEach(doc => lista.push(doc.data()))
      setAvaliacoes(lista)
    }

    if (freela?.id || freela?.uid) loadAvaliacoes()
  }, [freela])

  if (!freela) return null

  const media =
    avaliacoes.length > 0
      ? avaliacoes.reduce((soma, a) => soma + (a.nota || 0), 0) / avaliacoes.length
      : null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="flex flex-col items-center text-center">
          <img
            src={freela.foto || 'https://via.placeholder.com/100'}
            alt={freela.nome}
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100')}
            className="w-24 h-24 rounded-full object-cover border-4 border-orange-300"
          />
          <div className="mt-2">
            <h2 className="text-lg font-bold text-orange-700">{freela.nome}</h2>
            <p className="text-sm text-gray-600">{freela.funcao}</p>
            {freela.especialidades && (
              <p className="text-xs text-gray-500">
                {Array.isArray(freela.especialidades)
                  ? freela.especialidades.join(', ')
                  : freela.especialidades}
              </p>
            )}

            <p className="text-sm font-bold text-gray-800 mt-2">
              💰 Diária: R$ {Number(freela.valorDiaria || 0).toFixed(2)}
            </p>

            <p className="text-xs text-gray-600">
              📍 Distância:{' '}
              {freela.distanciaKm != null ? `${freela.distanciaKm.toFixed(1)} km` : '—'}
            </p>

            <div className="flex items-center justify-center mt-2 gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-xs ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>
                {isOnline ? '🟢 Disponível agora' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </div>

        {freela.descricao && (
          <div className="mt-4 text-sm text-gray-700 text-left">
            <p><strong>Descrição:</strong> {freela.descricao}</p>
          </div>
        )}

        {media !== null && (
          <div className="mt-4 text-sm text-gray-700 text-left">
            <p className="mb-1">
              <strong>Avaliação média:</strong>{' '}
              {media.toFixed(1)} ★ ({avaliacoes.length} avaliação{avaliacoes.length > 1 ? 'es' : ''})
            </p>
            <div className="flex items-center gap-1 text-yellow-500 text-base">
              {[1, 2, 3, 4, 5].map((n) =>
                media >= n ? <FaStar key={n} /> : <FaRegStar key={n} />
              )}
            </div>
          </div>
        )}

        {avaliacoes.length > 0 && (
          <div className="mt-3 text-left text-sm text-gray-700 space-y-2">
            <p className="font-semibold">🗣️ Últimos comentários:</p>
            <ul className="list-disc list-inside text-gray-600">
              {avaliacoes
                .filter((a) => a.comentario)
                .map((a, i) => (
                  <li key={i}>"{a.comentario}"</li>
                ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
