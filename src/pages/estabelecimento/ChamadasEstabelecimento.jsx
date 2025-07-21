import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import ChamadaInline from './ChamadaInline'

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

  if (chamadas.length === 0) {
    return <p className="text-center text-gray-600">📭 Nenhuma chamada registrada.</p>
  }

  return (
    <div className="grid gap-4">
      {chamadas.map(chamada => (
        <ChamadaInline key={chamada.id} chamada={chamada} tipo="estabelecimento" />
      ))}
    </div>
  )
}
