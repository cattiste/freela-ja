// src/pages/freela/ChamadasFreela.jsx
// versão com validação por localização desativada (check-in liberado)
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import AvaliacaoInline from '@/components/AvaliacaoInline'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'

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

const LIMITE_ACEITACAO_MS = 10 * 60 * 1000 // 10 min

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensagemConfirmacao, setMensagemConfirmacao] = useState(null)

  useEffect(() => {
    if (!usuario?.uid) return
    setLoading(true)

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', 'in', STATUS_LISTA)
    )

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setChamadas(docs)
      setLoading(false)
    }, (err) => {
      console.error('[ChamadasFreela] onSnapshot erro:', err)
      toast.error('Falha ao carregar suas chamadas.')
      setLoading(false)
    })

    return () => unsub()
  }, [usuario?.uid])

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0)
    return [...(Array.isArray(chamadas) ? chamadas : [])].sort((a, b) => {
      const aT = ts(a.criadoEm) || ts(a.aceitaEm) || ts(a.checkInFreelaHora) || 0
      const bT = ts(b.criadoEm) || ts(b.aceitaEm) || ts(b.checkInFreelaHora) || 0
      return bT - aT
    })
  }, [chamadas])

  useEffect(() => {
    const agora = Date.now()
    const candidatas = chamadasOrdenadas.filter((c) => {
      if (c.status !== 'aceita') return false
      const aceitaMs = c.aceitaEm?.toMillis?.() ?? (c.aceitaEm?.seconds ? c.aceitaEm.seconds * 1000 : 0)
      if (!aceitaMs || aceitaMs < 1_000_000_000_000) return false
      return (agora - aceitaMs) > LIMITE_ACEITACAO_MS
    })

    if (candidatas.length === 0) return

    candidatas.forEach(async (ch) => {
      try {
        await updateDoc(doc(db, 'chamadas', ch.id), {
          status: 'cancelada_por_falta_de_pagamento'
        })
      } catch (e) {
        console.warn('[ChamadasFreela] falha ao cancelar por timeout:', ch.id, e)
      }
    })
  }, [chamadasOrdenadas])

  async function aceitarChamada(chamada) {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        status: 'aceita',
        aceitaEm: serverTimestamp()
      })
      toast.success('✅ Chamada aceita!')
    } catch (err) {
      console.error('[ChamadasFreela] aceitarChamada erro:', err)
      toast.error('Erro ao aceitar chamada.')
    }
  }

  async function rejeitarChamada(chamada) {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        status: 'rejeitada',
        rejeitadaEm: serverTimestamp()
      })
      toast.success('❌ Chamada rejeitada.')
    } catch (err) {
      console.error('[ChamadasFreela] rejeitarChamada erro:', err)
      toast.error('Erro ao rejeitar chamada.')
    }
  }

  async function confirmarCheckIn(chamada) {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        status: 'checkin_freela',
        checkInFreela: true,
        checkInFreelaHora: serverTimestamp()
      })
      toast.success('✅ Check-in feito!')
      setMensagemConfirmacao('✅ Check-in feito! Vá até o caixa ou procure o responsável para confirmar sua presença.')
    } catch (e) {
      console.error('[ChamadasFreela] erro ao confirmar check-in:', e)
      toast.error(e?.code === 'permission-denied'
        ? 'Sem permissão para atualizar esta chamada.'
        : 'Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOut(chamada) {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        status: 'checkout_freela',
        checkOutFreela: true,
        checkOutFreelaHora: serverTimestamp()
      })
      toast.success('⏳ Check-out registrado!')
    } catch (e) {
      console.error('[ChamadasFreela] erro ao confirmar check-out:', e)
      toast.error('Erro ao confirmar check-out.')
    }
  }

  if (!usuario?.uid) {
    return <div className="text-center text-red-600 mt-10">⚠️ Acesso não autorizado. Faça login novamente.</div>
  }

  if (loading) {
    return <div className="text-center text-orange-600 mt-10">🔄 Carregando chamadas...</div>
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📞 Chamadas Recentes</h1>

      {mensagemConfirmacao && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-300 rounded p-3 mb-4 text-center">
          {mensagemConfirmacao}
        </p>
      )}

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada encontrada.</p>
      ) : (
        chamadasOrdenadas.map((chamada) => (
          <div key={chamada.id} className="bg-white shadow p-4 rounded-xl mb-4 border border-orange-200 space-y-2">
            <h2 className="font-semibold text-orange-600 text-lg">Chamada #{chamada?.id?.slice(-5)}</h2>
            <p><strong>Contratante:</strong> {chamada.contratanteNome || '—'}</p>
            <p><strong>Status:</strong> {chamada.status}</p>

            {chamada.observacao && (
              <p className="text-sm text-gray-800 mt-2">
                <strong>📝 Observação:</strong> {chamada.observacao}
              </p>
            )}

            {chamada.status === 'pendente' && (
              <>
                <button onClick={() => aceitarChamada(chamada)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                  ✅ Aceitar chamada
                </button>
                <button onClick={() => rejeitarChamada(chamada)} className="w-full bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition">
                  ❌ Rejeitar chamada
                </button>
              </>
            )}

            {(['aceita', 'pendente'].includes(chamada.status)) && !chamada.checkInFreela && (
              <button onClick={() => confirmarCheckIn(chamada)} className="w-full bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">
                📍 Fazer check-in
              </button>
            )}

            {(chamada.status === 'checkin_freela' || chamada.status === 'em_andamento') && !chamada.checkOutFreela && (
              <button onClick={() => confirmarCheckOut(chamada)} className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition">
                ⏳ Fazer check-out
              </button>
            )}

            {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
              <>
                <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
                <AvaliacaoInline chamada={chamada} tipo="freela" />
              </>
            )}

            {chamada.status === 'cancelada_por_falta_de_pagamento' && (
              <p className="text-sm text-red-600 font-semibold text-center">
                ❌ Chamada cancelada por falta de pagamento.
              </p>
            )}

            {chamada.status === 'rejeitada' && (
              <p className="text-sm text-red-600 font-semibold text-center">
                ❌ Chamada rejeitada.
              </p>
            )}

            <RespostasRapidasFreela chamadaId={chamada.id} />
          </div>
        ))
      )}
    </div>
  )
}
