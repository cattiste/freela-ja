// src/pages/contratante/HistoricoContratante.jsx
import React, { useEffect, useState } from 'react'
import { db } from '@/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import ChamadaInline from '@/components/ChamadaInline'

export default function HistoricoContratante() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return
    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', usuario.uid),
      where('status', 'in', ['finalizada', 'cancelada']),
      orderBy('criadoEm', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })
    return () => unsub()
  }, [usuario])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Histórico de Chamadas</h2>
      {chamadas.length === 0 && (
        <p className="text-gray-500">Nenhuma chamada finalizada ou cancelada.</p>
      )}
      <div className="space-y-4">
        {chamadas.map(chamada => (
          <ChamadaInline key={chamada.id} chamada={chamada} />
        ))}
      </div>
    </div>
  )
}
