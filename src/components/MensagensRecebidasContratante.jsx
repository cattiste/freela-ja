import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

function toDateLike(ts) {
  try {
    if (!ts) return null
    if (typeof ts?.toDate === 'function') return ts.toDate()
    if (typeof ts?.seconds === 'number') return new Date(ts.seconds * 1000)
    if (typeof ts === 'number') return new Date(ts)
    return null
  } catch { return null }
}

export default function MensagensRecebidasContratante({ chamadaId }) {
  const [mensagens, setMensagens] = useState([])

  useEffect(() => {
    if (!chamadaId) return

    const q = query(
      collection(db, 'chamadas', chamadaId, 'mensagens'),
      orderBy('criadoEm', 'asc') // se algumas tiverem createdAt, ainda funciona; as sem field vão primeiro
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => {
        const data = doc.data()
        const quando = toDateLike(data.criadoEm ?? data.createdAt)
        return {
          id: doc.id,
          texto: data.texto ?? data.mensagem ?? '',
          quando
        }
      })
      setMensagens(lista)
    })

    return () => unsub()
  }, [chamadaId])

  if (mensagens.length === 0) return null

  return (
    <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">📨 Mensagens recebidas:</p>
      <ul className="space-y-1 text-sm text-gray-800">
        {mensagens.map((msg) => (
          <li key={msg.id}>
            • {msg.texto}
            {msg.quando && (
              <span className="text-xs text-gray-500 ml-2">
                ({msg.quando.toLocaleTimeString('pt-BR')})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
