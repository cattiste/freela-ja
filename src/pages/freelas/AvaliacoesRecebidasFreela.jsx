import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function AvaliacoesRecebidasFreela({ freelaUid }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!freelaUid) return

    const q = query(collection(db, 'avaliacoesEstabelecimentos'), where('freelaUid', '==', freelaUid))
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const avals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAvaliacoes(avals)
        setLoading(false)
      },
      (error) => {
        console.error('Erro ao buscar avaliações:', error)
        setErro('Erro ao carregar avaliações.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [freelaUid])

  if (loading) return <p className="text-center text-gray-600">Carregando avaliações...</p>
  if (erro) return <p className="text-center text-red-600">{erro}</p>
  if (avaliacoes.length === 0)
    return <p className="text-center text-gray-600">Nenhuma avaliação recebida ainda.</p>

  return (
    <div className="space-y-4">
      {avaliacoes.map(avaliacao => (
        <div key={avaliacao.id} className="border p-4 rounded shadow-sm bg-white">
          <p><strong>Nota:</strong> {avaliacao.nota} ⭐</p>
          <p><strong>Comentário:</strong> {avaliacao.comentario || 'Sem comentário'}</p>
          <p className="text-sm text-gray-500">
            {avaliacao.dataCriacao?.toDate
              ? avaliacao.dataCriacao.toDate().toLocaleString()
              : 'Data não disponível'}
          </p>
        </div>
      ))}
    </div>
  )
}
