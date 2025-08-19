import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AvaliacoesRecebidasContratante() {
  const { usuario } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'avaliacoesContratantes'),
      where('contratanteUid', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setAvaliacoes(docs)
    })

    return () => unsubscribe()
  }, [usuario?.uid])

  if (!usuario) return null

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2 text-orange-700">⭐ Avaliações Recebidas</h2>
      {avaliacoes.length === 0 ? (
        <p className="text-gray-500">Ainda não há avaliações.</p>
      ) : (
        <ul className="space-y-3">
          {avaliacoes.map((a) => (
            <li key={a.id} className="border rounded p-3 bg-white shadow">
              <div className="flex items-center mb-1">
                <strong className="text-gray-700">Nota:</strong>
                <span className="ml-2 text-yellow-500">{'⭐'.repeat(a.nota)}</span>
              </div>
              <p className="text-sm text-gray-600 italic">"{a.comentario}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Chamada #{a.chamadaId?.slice(-5)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
