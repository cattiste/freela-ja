// src/pages/freelas/BuscarEventos.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { toast } from 'react-hot-toast'

export default function BuscarEventos() {
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'eventos'), where('status', '==', 'pago'))
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEventos(lista)
    })
    return () => unsub()
  }, [])

  const aceitarEvento = async (eventoId) => {
    try {
      const ref = doc(db, 'eventos', eventoId)
      await updateDoc(ref, {
        status: 'aceito',
        aceitoEm: serverTimestamp()
      })
      toast.success('Evento aceito!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao aceitar evento.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Eventos Disponíveis</h1>
      {eventos.length === 0 ? (
        <p className="text-gray-500">Nenhum evento disponível no momento.</p>
      ) : (
        <ul className="space-y-4">
          {eventos.map(evento => (
            <li key={evento.id} className="border p-4 rounded shadow">
              <p><strong>{evento.titulo}</strong></p>
              <p>{evento.descricao}</p>
              <p className="text-sm text-gray-500">Cidade: {evento.cidade}</p>
              <button
                onClick={() => aceitarEvento(evento.id)}
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              >
                Aceitar evento
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
