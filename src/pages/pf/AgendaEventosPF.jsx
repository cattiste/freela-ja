import React, { useEffect, useState } from 'react'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import dayjs from 'dayjs'

import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

export default function AgendaEventosPF() {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'eventos'),
      where('criadorUid', '==', usuario.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEventos(lista)
    })

    return () => unsub()
  }, [usuario])

  const agrupadosPorData = eventos.reduce((acc, ev) => {
    const data = ev.data || 'Sem data'
    if (!acc[data]) acc[data] = []
    acc[data].push(ev)
    return acc
  }, {})

  const datasOrdenadas = Object.keys(agrupadosPorData).sort((a, b) => {
    const da = dayjs(a, 'YYYY-MM-DD')
    const db = dayjs(b, 'YYYY-MM-DD')
    return da - db
  })

  return (
    <div className="space-y-6">
      {datasOrdenadas.map(data => (
        <div key={data} className="bg-white p-4 rounded-xl shadow border border-orange-100">
          <h3 className="text-orange-700 font-bold text-lg mb-2">📅 {dayjs(data).format('DD/MM/YYYY')}</h3>
          <ul className="space-y-2">
            {agrupadosPorData[data].map(evento => (
              <li key={evento.id} className="border-l-4 border-orange-500 pl-2">
                <p className="text-sm font-semibold">🎯 {evento.titulo}</p>
                <p className="text-xs text-gray-600">📍 {evento.endereco}</p>
                <p className="text-xs text-gray-500">Status: {evento.status || 'pendente'}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
