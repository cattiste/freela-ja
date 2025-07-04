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
      where('status', 'in', ['aceita', 'checkin', 'checkout']) // "finalizado" vai para histórico
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

  const formatarData = (data) => {
    try {
      return data?.toDate().toLocaleString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

  return (
    <div className="space-y-4">
      {chamadas.length === 0 && (
        <p className="text-gray-600 text-center mt-6">Nenhuma chamada ativa no momento.</p>
      )}

      {chamadas.map(chamada => (
        <div
          key={chamada.id}
          className="bg-white rounded-2xl shadow-md border border-orange-100 p-5 transition hover:shadow-lg hover:border-orange-300 space-y-2"
        >
          <p><strong>Vaga:</strong> {chamada.vagaTitulo}</p>
          <p><strong>Freela:</strong> {chamada.freelaNome}</p>
          <p><strong>Data da chamada:</strong> {formatarData(chamada.criadoEm)}</p>
          <p><strong>Status da chamada:</strong> <span className="font-semibold text-orange-700">{chamada.status}</span></p>

          <p>
            <strong>Check-in:</strong>{' '}
            {chamada.checkInFreela
              ? chamada.checkInEstabelecimentoConfirmado
                ? '✅ Confirmado'
                : '⏳ Aguardando confirmação'
              : '❌ Ainda não realizado'}{' '}
              {chamada.checkInHora && <span className="text-sm text-gray-600">({formatarData(chamada.checkInHora)})</span>}
          </p>

          <p>
            <strong>Check-out:</strong>{' '}
            {chamada.checkOutFreela
              ? chamada.checkOutEstabelecimentoConfirmado
                ? '✅ Confirmado'
                : '⏳ Aguardando confirmação'
              : '❌ Ainda não realizado'}{' '}
              {chamada.checkOutHora && <span className="text-sm text-gray-600">({formatarData(chamada.checkOutHora)})</span>}
          </p>

          <div className="flex gap-2 flex-wrap mt-2">
            {chamada.checkInFreela && !chamada.checkInEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkin')}
                disabled={loadingId === chamada.id}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                {loadingId === chamada.id ? 'Aguarde...' : '✅ Confirmar Check-in'}
              </button>
            )}

            {chamada.checkOutFreela && !chamada.checkOutEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkout')}
                disabled={loadingId === chamada.id}
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                {loadingId === chamada.id ? 'Aguarde...' : '✅ Confirmar Check-out'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
