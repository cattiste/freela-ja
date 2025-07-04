import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function AgendasContratadas({ estabelecimento }) {
  const [agendas, setAgendas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', '==', 'aceito')
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAgendas(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  if (loading) return <p>Carregando agendas contratadas...</p>
  if (agendas.length === 0) return <p>Nenhuma agenda contratada.</p>

  return (
    <div className="space-y-4">
      {agendas.map(agenda => (
        <div
          key={agenda.id}
          className="bg-white p-4 rounded shadow flex flex-col gap-2"
        >
          <p><strong>Freela:</strong> {agenda.freelaNome}</p>
          <p><strong>Título da Vaga:</strong> {agenda.vagaTitulo}</p>
          <p><strong>Status:</strong> {agenda.status}</p>
        </div>
      ))}
    </div>
  )
}
