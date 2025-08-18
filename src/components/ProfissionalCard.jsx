import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ProfissionalCard({ prof }) {
  const [media, setMedia] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])

  useEffect(() => {
    if (!prof?.id) return

    const q = query(
      collection(db, 'avaliacoesFreelas'),
      where('freelaUid', '==', prof.id),
      orderBy('criadoEm', 'desc'),
      limit(3)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const notas = []
      const comentarios = []
      snap.forEach((doc) => {
        const data = doc.data()
        if (typeof data.nota === 'number') notas.push(data.nota)
        if (data.comentario) comentarios.push(data.comentario)
      })
      const mediaFinal = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null
      setMedia(mediaFinal)
      setAvaliacoes(comentarios)
    })

    return () => unsubscribe()
  }, [prof?.id])

  const imagem = prof?.foto || 'https://via.placeholder.com/100'

  const ultimaHora = prof?.ultimaAtividade?.seconds
    ? new Date(prof.ultimaAtividade.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'desconhecida'

  return (
    <div className="text-center space-y-3">
      <img
        src={imagem}
        alt={prof.nome}
        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100')}
        className="w-28 h-28 rounded-full object-cover border-4 border-orange-400 mx-auto shadow"
      />

      <h2 className="text-xl font-bold text-orange-700">{prof.nome}</h2>

      <p className="text-gray-700"><strong>Função:</strong> {prof.funcao || 'Não informado'}</p>
      {prof.descricao && <p className="text-gray-600 italic text-sm">{prof.descricao}</p>}
      {prof.endereco && <p className="text-sm text-gray-700">📍 {prof.endereco}</p>}

      {media !== null && (
        <div className="flex justify-center items-center gap-1 text-yellow-500 text-lg">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n}>{media >= n ? '★' : '☆'}</span>
          ))}
        </div>
      )}

      {avaliacoes.length > 0 && (
        <div className="text-left mt-3">
          <h4 className="text-sm font-bold text-gray-800 mb-1">Últimos comentários:</h4>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            {avaliacoes.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-3">
        <span className={`w-2 h-2 rounded-full ${prof.online ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className={`text-xs ${prof.online ? 'text-green-700' : 'text-gray-500'}`}>
          {prof.online ? '🟢 Online agora' : `🔴 Offline (última: ${ultimaHora})`}
        </span>
      </div>
    </div>
  )
}
