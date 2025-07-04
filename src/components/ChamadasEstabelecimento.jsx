import React, { useEffect, useState, useRef } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loadingId, setLoadingId] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin', 'checkout', 'finalizado'])
    )

    let primeiraCarga = true

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Som discreto quando o freela fizer check-in ou check-out novo
      if (!primeiraCarga) {
        lista.forEach(chamada => {
          if (chamada.checkInFreela && !chamada.checkInEstabelecimentoConfirmado) {
            const audio = new Audio('/sons/confirmar.mp3')
            audio.play().catch(() => {})
          }
          if (chamada.checkOutFreela && !chamada.checkOutEstabelecimentoConfirmado) {
            const audio = new Audio('/sons/confirmar.mp3')
            setTimeout(() => audio.play().catch(() => {}), 500)
          }
        })
      }

      setChamadas(lista)
      primeiraCarga = false
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

        // ✅ Só finalizar se ambas partes confirmaram
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
        <div key={chamada.id} className="bg-white p-4 rounded shadow space-y-2 border">
          <p><strong>Vaga:</strong> {chamada.vagaTitulo}</p>
          <p><strong>Freela:</strong> {chamada.freelaNome}</p>
          <p><strong>Status:</strong> {chamada.status}</p>

          <p>
            <strong>Check-in:</strong>{' '}
            {chamada.checkInFreela
              ? chamada.checkInEstabelecimentoConfirmado
                ? '✅ Confirmado'
                : '⏳ Aguardando confirmação'
              : '❌ Ainda não realizado'}
          </p>

          <p>
            <strong>Check-out:</strong>{' '}
            {chamada.checkOutFreela
              ? chamada.checkOutEstabelecimentoConfirmado
                ? '✅ Confirmado'
                : '⏳ Aguardando confirmação'
              : '❌ Ainda não realizado'}
          </p>

          <div className="flex gap-2 flex-wrap mt-2">
            {chamada.status === 'pendente' && (
              <button
                onClick={() => updateDoc(doc(db, 'chamadas', chamada.id), { status: 'aceita' })}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Aceitar
              </button>
            )}

            {chamada.checkInFreela && !chamada.checkInEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkin')}
                disabled={loadingId === chamada.id}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar Check-in'}
              </button>
            )}

            {chamada.checkOutFreela && !chamada.checkOutEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkout')}
                disabled={loadingId === chamada.id}
                className="bg-indigo-600 text-white px-3 py-1 rounded"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar Check-out'}
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
