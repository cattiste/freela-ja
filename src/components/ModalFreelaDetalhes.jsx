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

        <div className="flex items-center gap-4 mb-4">
          <img
            src={freela.foto || '/placeholder-avatar.png'}
            alt={freela.nome}
            className="w-16 h-16 rounded-full object-cover border border-orange-200"
          />
          <div>
            <h2 className="text-lg font-bold text-orange-700">{freela.nome}</h2>
            <p className="text-sm text-gray-600">
              {freela.funcao || 'Função não informada'}
              {freela.especialidade && ` / ${freela.especialidade}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Diária: R$ {freela.valorDiaria?.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Distância:</strong>{' '}
            {freela.distanciaKm != null ? `${freela.distanciaKm.toFixed(1)} km` : '—'}
          </p>
          {freela.descricao && (
            <p><strong>Descrição:</strong> {freela.descricao}</p>
          )}
          {media !== null && (
            <p>
              <strong>Média de avaliação:</strong>{' '}
              {media.toFixed(1)} ★ ({avaliacoes.length} avaliação{avaliacoes.length > 1 ? 'es' : ''})
            </p>
          )}
        </div>

        <div className="mt-4">
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
