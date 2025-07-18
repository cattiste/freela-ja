// src/components/ChamadasEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (!estabelecimento?.uid) return

   const q = query(
     collection(db, 'chamadas'),
     where('estabelecimentoUid', '==', estabelecimento.uid),
     where('status', 'in', ['chamado', 'checkin_freela', 'checkin_confirmado', 'checkout_freela', 'checkout_confirmado'])
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
        await updateDoc(chamadaRef, {
          checkInEstabelecimento: true,
          status: 'checkin_confirmado'
        })
      }

      if (etapa === 'checkout') {
        await updateDoc(chamadaRef, {
          checkOutEstabelecimento: true,
          status: 'finalizado'
        })
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
    <div className="flex flex-wrap gap-4 justify-center">
      {chamadas.length === 0 && (
        <p className="text-gray-600 text-center mt-6 w-full">Nenhuma chamada ativa no momento.</p>
      )}

      {chamadas.map(chamada => (
        <div
          key={chamada.id}
          className="bg-white rounded-xl shadow-md border border-orange-100 p-4 hover:shadow-lg hover:border-orange-300 flex items-center justify-between space-x-4"
          style={{ maxWidth: '400px', minWidth: '300px' }}
        >
          <div className="flex flex-col flex-grow overflow-hidden">
            <p className="font-semibold text-orange-700 truncate" title={chamada.vagaTitulo}>
              Vaga: {chamada.vagaTitulo}
            </p>
            <p className="text-gray-700 truncate" title={chamada.freelaNome}>
              Freela: {chamada.freelaNome}
            </p>
            <p className="text-sm text-gray-500 mt-1 truncate" title={`Data da chamada: ${formatarData(chamada.criadoEm)}`}>
              {formatarData(chamada.criadoEm)}
            </p>
            <p className="text-sm font-semibold text-orange-600 mt-1">
              Status: {chamada.status}
            </p>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {chamada.checkInFreela && !chamada.checkInEstabelecimento && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkin')}
                disabled={loadingId === chamada.id}
                className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                title="Confirmar Check-in"
              >
                {loadingId === chamada.id ? '...' : '✔️ Check-in'}
              </button>
            )}

            {chamada.checkOutFreela && !chamada.checkOutEstabelecimento && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkout')}
                disabled={loadingId === chamada.id}
                className="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700"
                title="Confirmar Check-out"
              >
                {loadingId === chamada.id ? '...' : '✔️ Check-out'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
