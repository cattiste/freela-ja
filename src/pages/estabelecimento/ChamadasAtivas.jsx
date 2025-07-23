
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasAtivas({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const todasChamadas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Deduplicação por freelaUid
      const unicas = {}
      todasChamadas.forEach((chamada) => {
        const existente = unicas[chamada.freelaUid]
        const novaData = chamada.criadoEm?.toMillis?.() || 0
        const dataExistente = existente?.criadoEm?.toMillis?.() || 0

        if (!existente || novaData > dataExistente) {
          unicas[chamada.freelaUid] = chamada
        }
      })

      setChamadas(Object.values(unicas))
    })

    return () => unsub()
  }, [estabelecimento])

  if (!chamadas.length) {
    return <div className="text-center mt-6 text-gray-500">Nenhuma chamada ativa no momento.</div>
  }

  return (
    <div className="space-y-3">
      {chamadas.map((chamada) => (
        <div key={chamada.id} className="p-3 bg-white rounded-xl shadow border border-orange-100">
          <p className="text-orange-600 font-bold">Chamada #{chamada.codigo || chamada.id.slice(-5)}</p>
          <p className="text-sm">👤 {chamada.freelaNome}</p>
          <p className="text-sm">📌 Status: {chamada.status}</p>
        </div>
      ))}
    </div>
  )
}
