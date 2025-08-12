// src/components/ProfissionalCard.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ProfissionalCard({ prof, onChamar, distanciaKm, online = false, ultimaHora = '' }) {
  const [media, setMedia] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!prof?.id) return
    const q = query(collection(db, 'avaliacoesFreelas'), where('freelaUid', '==', prof.id))
    const unsubscribe = onSnapshot(q, (snap) => {
      const notas = snap.docs.map(d => d.data().nota).filter(n => typeof n === 'number')
      const soma = notas.reduce((acc, n) => acc + n, 0)
      setMedia(notas.length ? soma / notas.length : null)
      setTotal(notas.length)
    })
    return () => unsubscribe()
  }, [prof?.id])

  const img = prof?.foto || 'https://via.placeholder.com/96'
  const diariaNumerica = Number.isFinite(Number(prof?.valorDiaria))
  const totalAvaliacoes = total

  return (
    <div className="bg-white rounded-2xl p-5 m-4 max-w-xs shadow-md text-center">
      <img
        src={img}
        alt={prof?.nome || 'Profissional'}
        className="w-24 h-24 rounded-full object-cover mb-3 mx-auto border-2 border-orange-400 shadow"
      />

      <h3 className="text-lg font-bold text-gray-800">
        {prof?.nome || 'Nome não informado'}
      </h3>

      <p className="text-gray-700 mt-1">
        <strong>Função:</strong> {prof?.funcao || 'Não informado'}
      </p>

      {prof?.endereco && (
        <p className="text-gray-700 mt-1">
          <strong>Endereço:</strong> {prof.endereco}
        </p>
      )}

      {typeof distanciaKm === 'number' && (
        <p className="text-blue-600 mt-1">
          <strong>📍 Distância:</strong> {distanciaKm.toFixed(1)} km
        </p>
      )}

      {media != null && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className="text-yellow-500 text-lg">
              {media >= n ? '★' : '☆'}
            </span>
          ))}
          <span className="text-sm text-gray-500">({totalAvaliacoes})</span>
        </div>
      )}

      {diariaNumerica && (
        <p className="text-green-600 font-semibold mt-1">
          <strong>💸 Diária:</strong> R$ {Number(prof.valorDiaria).toFixed(2)}
        </p>
      )}

      {prof?.descricao && (
        <p className="italic mt-2 text-sm text-gray-600">{prof.descricao}</p>
      )}

      <div className="flex items-center justify-center gap-2 mt-2">
        <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className={`text-xs ${online ? 'text-green-700' : 'text-gray-500'}`}>
          {online ? '🟢 Online agora' : (ultimaHora ? `🔴 Offline (última: ${ultimaHora})` : '🔴 Offline')}
        </span>
      </div>

      {onChamar && (
        <button
          onClick={() => onChamar(prof)}
          className="bg-green-600 text-white py-2 px-4 rounded-xl mt-4 hover:bg-green-700"
        >
          📩 Chamar
        </button>
      )}
    </div>
  )
}
