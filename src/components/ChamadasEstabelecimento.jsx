
// ChamadasEstabelecimento.jsx (com dupla confirmação)
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin', 'checkout', 'finalizado'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  async function confirmarEtapa(chamada, etapa) {
    setLoadingId(chamada.id)
    const chamadaRef = doc(db, 'chamadas', chamada.id)
    try {
      if (etapa === 'checkin') {
        await updateDoc(chamadaRef, { checkInEstabelecimentoConfirmado: true })
      }

      if (etapa === 'checkout') {
        await updateDoc(chamadaRef, { checkOutEstabelecimentoConfirmado: true })

        if (chamada.checkOutFreela) {
          await updateDoc(chamadaRef, { status: 'finalizado' })
        }
      }
    } catch (err) {
      console.error(`Erro ao confirmar ${etapa}:`, err)
      alert('Erro ao confirmar etapa.')
    }
    setLoadingId(null)
  }

  return (
    <div className="space-y-4">
      {chamadas.map(chamada => (
        <div key={chamada.id} className="bg-white p-4 rounded shadow space-y-2">
          <p><strong>Vaga:</strong> {chamada.vagaTitulo}</p>
          <p><strong>Freela:</strong> {chamada.freelaNome}</p>
          <p><strong>Status:</strong> {chamada.status}</p>

          <div className="flex gap-2 flex-wrap">
            {chamada.status === 'pendente' && (
              <button onClick={() => updateDoc(doc(db, 'chamadas', chamada.id), { status: 'aceita' })}>
                Aceitar
              </button>
            )}

            {chamada.checkInFreela && !chamada.checkInEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkin')}
                disabled={loadingId === chamada.id}
              >
                ✅ Confirmar Check-in
              </button>
            )}

            {chamada.checkOutFreela && !chamada.checkOutEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkout')}
                disabled={loadingId === chamada.id}
              >
                ✅ Confirmar Check-out
              </button>
            )}

            {chamada.status === 'finalizado' && (
              <span className="text-green-600 font-semibold">✅ Serviço finalizado</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
