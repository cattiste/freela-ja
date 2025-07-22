import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import ChamadaInline from '@/components/ChamadaInline'

export default function ChamadasAtivas({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(docs)
    })

    return () => unsub()
  }, [estabelecimento])

  if (!chamadas.length) {
    return <div className="text-center mt-6 text-gray-500">Nenhuma chamada ativa no momento.</div>
  }

  return (
    <div className="space-y-4">
      {chamadas.map((chamada) => (
        <ChamadaInline
          key={chamada.id}
          chamada={chamada}
          tipo="estabelecimento"
          usuario={estabelecimento}
        />
      ))}
    </div>
  )
}
