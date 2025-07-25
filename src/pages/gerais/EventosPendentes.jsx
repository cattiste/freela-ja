// src/pages/gerais/EventosPendentes.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function EventosPendentes() {
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'eventos'), where('status', '!=', 'finalizado'))
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEventos(lista)
    })
    return () => unsub()
  }, [])

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Seus Eventos Pendentes</h1>
      {eventos.length === 0 ? (
        <p className="text-gray-500">Nenhum evento ativo no momento.</p>
      ) : (
        <ul className="space-y-4">
          {eventos.map(evento => (
            <li key={evento.id} className="border p-4 rounded shadow">
              <p><strong>Título:</strong> {evento.titulo}</p>
              <p><strong>Data:</strong> {new Date(evento.dataEvento).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {evento.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
