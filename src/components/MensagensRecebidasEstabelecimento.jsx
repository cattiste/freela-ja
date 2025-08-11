import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function MensagensRecebidasEstabelecimento({ chamadaId }) {
  const [mensagens, setMensagens] = useState([])

  useEffect(() => {
    if (!chamadaId) return

    const q = query(
      collection(db, 'chamadas', chamadaId, 'mensagens'),
      orderBy('criadoEm', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
            • {msg.mensagem}
            {msg.criadoEm?.toDate && (
              <span className="text-xs text-gray-500 ml-2">
                ({msg.criadoEm.toDate().toLocaleTimeString('pt-BR')})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
