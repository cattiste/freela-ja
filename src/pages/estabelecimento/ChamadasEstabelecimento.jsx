
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid)
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setChamadas(lista)
      setCarregando(false)
    }, err => {
      console.error('Erro ao buscar chamadas:', err)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  if (carregando) return <p className="text-center text-orange-600">🔄 Carregando chamadas...</p>
  if (chamadas.length === 0) return <p className="text-center text-gray-600">📭 Nenhuma chamada registrada.</p>

  return (
    <div className="space-y-3">
      {chamadas.map(chamada => (
        <div key={chamada.id} className="p-3 bg-white rounded-xl shadow border border-orange-100">
          <p className="text-orange-600 font-bold">Chamada #{chamada.codigo || chamada.id.slice(-5)}</p>
          <p className="text-sm">👤 {chamada.freelaNome}</p>
          <p className="text-sm">📌 Status: {chamada.status}</p>
        </div>
      ))}
    </div>
  )
}
