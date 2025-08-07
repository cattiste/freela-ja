// src/pages/pf/AvaliacoesRecebidasPF.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'

export default function AvaliacoesRecebidasPF() {
  const { usuario } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'avaliacoesFreelas'),
      where('estabelecimentoUid', '==', usuario.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAvaliacoes(lista)
    })

    return () => unsub()
  }, [usuario])

  if (avaliacoes.length === 0) {
    return <p className="text-sm text-gray-500 text-center">Nenhuma avaliação recebida ainda.</p>
  }

  return (
    <div className="space-y-4">
      {avaliacoes.map(av => (
        <div key={av.id} className="bg-white rounded-xl shadow p-4 border border-orange-100">
          <p className="font-bold text-orange-700">⭐ {av.nota} / 5</p>
          <p className="text-sm text-gray-800 mt-2">{av.comentario}</p>
          <p className="text-xs text-gray-500 mt-1">Por: {av.freelaNome || 'Anônimo'}</p>
        </div>
      ))}
    </div>
  )
}
