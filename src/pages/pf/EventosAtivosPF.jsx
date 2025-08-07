import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function EventosAtivosPF() {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'eventos'),
      where('criadorUid', '==', usuario.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEventos(lista)
    })

    return () => unsubscribe()
  }, [usuario])

  if (!eventos.length) {
    return <div className="text-center text-gray-500 mt-6">Nenhum evento encontrado.</div>
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <div key={evento.id} className="bg-white rounded-xl shadow p-4 border border-orange-100">
          <h3 className="text-lg font-bold text-orange-600">{evento.titulo}</h3>
          <p className="text-sm text-gray-600">📅 {evento.data}</p>
          <p className="text-sm text-gray-600">📍 {evento.endereco}</p>
          <p className="text-sm text-gray-600">🎯 Status: <span className="font-semibold">{evento.status || 'pendente'}</span></p>
        </div>
      ))}
    </div>
  )
}
