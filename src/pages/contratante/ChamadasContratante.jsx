// src/components/ChamadasContratante.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'
import MensagensRecebidasContratante from '@/components/MensagensRecebidasContratante'
import ListaCartoes from '@/components/ListaCartoes'
import SalvarSenhaCartao from '@/components/SalvarSenhaCartao'

const STATUS_LISTA = [
  'pendente', 'aceita', 'confirmada', 'checkin_freela',
  'em_andamento', 'checkout_freela', 'concluido',
  'finalizada', 'cancelada_por_falta_de_pagamento', 'rejeitada', 'pago'
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
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const filtradas = docs.filter((ch) =>
        ch.status !== 'rejeitada' &&
        !(ch.status === 'concluido' && ch.avaliadoPeloContratante) &&
        ch.status !== 'finalizada'
      )
      setChamadas(filtradas)
      setLoading(false)
    }, (err) => {
      console.error('[ChamadasContratante] onSnapshot erro:', err)
      toast.error('Falha ao carregar chamadas.')
      setLoading(false)
    })
    return () => unsub()
  }, [estab?.uid])

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0)
    return [...chamadas].sort((a, b) => ts(b.criadoEm) - ts(a.criadoEm))
  }, [chamadas])

  // ---- ações (mantidas) ----
  async function confirmarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'confirmada',
        confirmadaEm: serverTimestamp()
      })
      toast.success('✅ Chamada confirmada!')
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar chamada.')
    }
  }

  async function cancelarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'cancelada_por_falta_de_pagamento',
        canceladaEm: serverTimestamp()
      })
      toast.success('❌ Chamada cancelada.')
    } catch (e) {
      console.error(e); toast.error('Erro ao cancelar chamada.')
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
      console.error(e); toast.error('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOutFreela(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'concluido',
        checkOutConfirmadoPeloEstab: true,
        checkOutConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('⏳ Check-out confirmado!')
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar check-out.')
    }
  }

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      {/* 💳 Seção de pagamentos (gestão de cartão/senha) mantida */}
      <div className="bg-white shadow border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-orange-700">💳 Pagamentos</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ListaCartoes />
          <SalvarSenhaCartao uid={estab?.uid} />
        </div>
      </div>

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa.</p>
      ) : chamadasOrdenadas.map((ch) => (
        <div key={ch.id} className="bg-white shadow p-4 rounded-xl mb-4 border space-y-2">
          <h2 className="font-semibold text-orange-600">Chamada #{String(ch.id).slice(-5)}</h2>
          <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
          <p><strong>Status:</strong> {ch.status}</p>
          {typeof ch.valorDiaria === 'number' && (
            <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
          )}
          {ch.observacao && <p>📝 {ch.observacao}</p>}

          <MensagensRecebidasContratante chamadaId={ch.id} />

          {ch.status === 'concluido' && !ch.avaliadoPeloContratante && (
            <AvaliacaoContratante chamada={ch} />
          )}

          {/* ✅ Removidos os botões de pagamento do card (Cartão/PIX) */}
          {/* Mantidos apenas confirmar/cancelar e check-ins */}
          {ch.status === 'aceita' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => confirmarChamada(ch)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                ✅ Confirmar
              </button>
              <button onClick={() => cancelarChamada(ch)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
                ❌ Cancelar
              </button>
            </div>
          )}

          {(ch.qrCodePix || ch.copiaColaPix) && (
            <div className="bg-gray-50 border rounded-lg p-2 text-center">
              <p className="font-semibold text-green-600">✅ Pix gerado</p>
              {ch.qrCodePix && (
                <img src={ch.qrCodePix} alt="QR Code Pix" className="mx-auto w-40" />
              )}
              {ch.copiaColaPix && (
                <p className="text-xs break-all">{ch.copiaColaPix}</p>
              )}
            </div>
          )}

          {ch.status === 'checkin_freela' && (
            <button onClick={() => confirmarCheckInFreela(ch)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              📍 Confirmar Check-in
            </button>
          )}
          {ch.status === 'checkout_freela' && (
            <button onClick={() => confirmarCheckOutFreela(ch)}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
              ⏳ Confirmar Check-out
            </button>
          )}
          {(ch.status === 'concluido' || ch.status === 'finalizada') && (
            <span className="text-green-600 font-bold block text-center">✅ Finalizada</span>
          )}
        </div>
      ))}
    </div>
  )
}
