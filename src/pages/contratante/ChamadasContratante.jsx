// src/pages/contratante/ChamadasContratante.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

const STATUS_LISTA = [
  'pendente',
  'aceita',
  'checkin_freela',
  'em_andamento',
  'checkout_freela',
  'concluido',
  'finalizada',
  'cancelada_por_falta_de_pagamento',
  'rejeitada'
]

export default function ChamadasContratante({ contratante }) {
  const { usuario } = useAuth()
  const estab = contratante || usuario
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!estab?.uid) return
    setLoading(true)

    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', estab.uid),
      where('status', 'in', STATUS_LISTA)
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setChamadas(docs)
        setLoading(false)
      },
      (err) => {
        console.error('[ChamadasContratante] onSnapshot erro:', err)
        toast.error('Falha ao carregar chamadas.')
        setLoading(false)
      }
    )

    return () => unsub()
  }, [estab?.uid])

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0)
    return [...chamadas].sort((a, b) => {
      const aT = ts(a.criadoEm) || ts(a.aceitaEm) || ts(a.checkInFreelaHora) || 0
      const bT = ts(b.criadoEm) || ts(b.aceitaEm) || ts(b.checkInFreelaHora) || 0
      return bT - aT
    })
  }, [chamadas])

    async function confirmarConvite(ch) {
      try {
        await updateDoc(doc(db, 'chamadas', ch.id), {
          status: 'confirmada',
          confirmadaEm: serverTimestamp()
        })
        toast.success('✅ Convite confirmado!')
      } catch (e) {
        console.error('[ChamadasContratante] confirmarConvite erro:', e)
        toast.error('Erro ao confirmar convite.')
      }
    }

  async function cancelarConvite(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'cancelada_por_falta_de_pagamento',
        canceladaEm: serverTimestamp()
      })
      toast.success('❌ Convite cancelado.')
    } catch (e) {
      console.error('[ChamadasContratante] cancelarConvite erro:', e)
      toast.error('Erro ao cancelar convite.')
    }
  }

  async function confirmarCheckInFreela(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'em_andamento',
        checkInConfirmadoPeloEstab: true,
        checkInConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('📍 Check-in do freela confirmado!')
    } catch (e) {
      console.error('[ChamadasContratante] confirmarCheckInFreela erro:', e)
      toast.error('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOutFreela(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'concluido',
        checkOutConfirmadoPeloEstab: true,
        checkOutConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('⏳ Check-out do freela confirmado!')
    } catch (e) {
      console.error('[ChamadasContratante] confirmarCheckOutFreela erro:', e)
      toast.error('Erro ao confirmar check-out.')
    }
  }

  if (loading) {
    return <div className="text-center text-orange-600 mt-8">🔄 Carregando chamadas…</div>
  }

  if (!estab?.uid) {
    return <div className="text-center text-red-600 mt-8">⚠️ Contratante não autenticado.</div>
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa no momento.</p>
      ) : (
        chamadasOrdenadas.map((ch) => (
          <div key={ch.id} className="bg-white shadow p-4 rounded-xl mb-4 border border-orange-200 space-y-2">
            <h2 className="font-semibold text-orange-600 text-lg">Chamada #{ch?.id?.slice(-5)}</h2>
            <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
            <p><strong>Status:</strong> {ch.status}</p>
            {typeof ch.valorDiaria === 'number' && (
              <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
            )}
            {ch.observacao && (
              <p className="text-sm text-gray-800"><strong>📝 Observação:</strong> {ch.observacao}</p>
            )}

            {ch.status === 'aceita' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => confirmarConvite(ch)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  ✅ Confirmar convite
                </button>
                <button
                  onClick={() => cancelarConvite(ch)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  ❌ Cancelar convite
                </button>
              </div>
            )}

            {ch.status === 'checkin_freela' && (
              <button
                onClick={() => confirmarCheckInFreela(ch)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                📍 Confirmar check-in do freela
              </button>
            )}

            {ch.status === 'checkout_freela' && (
              <button
                onClick={() => confirmarCheckOutFreela(ch)}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                ⏳ Confirmar check-out do freela
              </button>
            )}

            {(ch.status === 'concluido' || ch.status === 'finalizada') && (
              <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
            )}
          </div>
        ))
      )}
    </div>
  )
}