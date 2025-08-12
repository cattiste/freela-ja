// src/pages/gerais/EventosPendentes.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

function toDateSafe(v) {
  try {
    if (!v) return null
    if (typeof v?.toDate === 'function') return v.toDate()
    const d = new Date(v)
    return Number.isFinite(d?.getTime()) ? d : null
  } catch {
    return null
  }
}

export default function EventosPendentes() {
  const [eventos, setEventos] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    // Firestore: consultas com '!=' exigem um orderBy no mesmo campo
    const q = query(
      collection(db, 'eventos'),
      where('status', '!=', 'finalizado'),
      orderBy('status') // satisfaz a restrição do Firestore
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setEventos(lista)
      },
      (err) => {
        console.error('[EventosPendentes] onSnapshot error:', err)
        setErro('Não foi possível carregar os eventos agora.')
        toast.error('Erro ao carregar eventos.')
      }
    )
    return () => unsub()
  }, [])

  const lista = useMemo(() => {
    const arr = eventos.slice()
    arr.sort((a, b) => {
      const da = toDateSafe(a.dataEvento)?.getTime() ?? 0
      const dbb = toDateSafe(b.dataEvento)?.getTime() ?? 0
      if (da !== dbb) return da - dbb
      const ta = (a.titulo || '').toString().toLowerCase()
      const tb = (b.titulo || '').toString().toLowerCase()
      return ta.localeCompare(tb)
    })
    return arr
  }, [eventos])

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-2">Seus Eventos Pendentes</h1>
      <p className="text-sm text-gray-500 mb-4">
        {erro ? '—' : `${lista.length} registro(s)`}
      </p>

      {erro && (
        <div className="p-4 border rounded bg-red-50 text-red-700">{erro}</div>
      )}

      {!erro && lista.length === 0 && (
        <p className="text-gray-500">Nenhum evento ativo no momento.</p>
      )}

      {!erro && lista.length > 0 && (
        <ul className="space-y-4">
          {lista.map((evento) => {
            const d = toDateSafe(evento.dataEvento)
            const dataFmt = d ? d.toLocaleDateString('pt-BR') : '—'
            return (
              <li key={evento.id} className="border p-4 rounded shadow-sm bg-white">
                <p className="font-medium text-gray-900">
                  <strong>Título:</strong> {evento.titulo || '—'}
                </p>
                <p className="text-gray-700">
                  <strong>Data:</strong> {dataFmt}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong> {evento.status || '—'}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
