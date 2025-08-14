import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ModalFreelaDetalhes({ freela, onClose }) {
  const [avaliacoes, setAvaliacoes] = useState([])

  useEffect(() => {
    async function loadAvaliacoes() {
      if (!freela?.id) return
      const q = query(
        collection(db, 'avaliacoes'),
        where('avaliadoId', '==', freela.id),
        where('tipo', '==', 'freela')
      )
      const snap = await getDocs(q)
      const lista = []
      snap.forEach(doc => lista.push(doc.data()))
      setAvaliacoes(lista)
    }

    if (freela?.id) {
      loadAvaliacoes()
    }
  }, [freela?.id])

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
            src={freela.foto || '/placeholder-avatar.png'}
            alt={freela.nome}
            className="w-24 h-24 rounded-full object-cover border border-orange-300"
          />
          <div className="mt-2">
            <h2 className="text-lg font-bold text-orange-700">{freela.nome}</h2>
            <p className="text-sm text-gray-600">{freela.funcao}</p>
            {freela.especialidades?.length > 0 && (
              <p className="text-xs text-gray-500">{Array.isArray(freela.especialidades) ? freela.especialidades.join(', ') : freela.especialidades}</p>
            )}
            <p className="text-sm font-bold text-gray-800 mt-2">Diária: R$ {freela.valorDiaria?.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Distância: {freela.distanciaKm != null ? `${freela.distanciaKm.toFixed(1)} km` : '—'}</p>
            {freela.online !== undefined && (
              <p className={`mt-1 text-xs font-semibold ${
                freela.online ? 'text-green-600' : 'text-gray-500'
              }`}>
                {freela.online ? 'Disponível agora' : 'Offline'}
              </p>
            )}
          </div>
        </div>

        {freela.descricao && (
          <div className="mt-4 text-sm text-gray-700">
            <p><strong>Descrição:</strong> {freela.descricao}</p>
          </div>
        )}

        {media !== null && (
          <div className="mt-4 text-sm text-gray-700">
            <p>
              <strong>Avaliação média:</strong>{' '}
              {media.toFixed(1)} ★ ({avaliacoes.length} avaliação{avaliacoes.length > 1 ? 'es' : ''})
            </p>
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
