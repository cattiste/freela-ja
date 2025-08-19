// src/pages/contratante/AvaliacoesRecebidasContratante.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
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

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setAvaliacoes(docs)
    })

    return () => unsub()
  }, [usuario?.uid])

  if (!avaliacoes.length) {
    return <p className="text-gray-500">Nenhuma avaliação recebida ainda.</p>
  }

  return (
    <div className="space-y-4">
      {avaliacoes.map((av) => (
        <div key={av.id} className="bg-white p-4 rounded shadow border">
          <div className="flex items-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= av.nota ? 'text-yellow-500' : 'text-gray-300'}>
                ⭐
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700">{av.comentario}</p>
        </div>
      ))}
    </div>
  )
}
