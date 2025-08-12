// src/pages/freela/ChamadasFreela.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

function fmtData(ts) {
  try {
    if (!ts) return '—'
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString('pt-BR')
    return new Date(ts).toLocaleString('pt-BR')
  } catch {
    return '—'
  }
}

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensagemConfirmacao, setMensagemConfirmacao] = useState(null)

  // 1) Assinatura das chamadas ativas do freela
  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', 'in', [
        'pendente',
        'aceita',
        'checkin_freela',
        'em_andamento',
        'checkout_freela',
        'concluido',
        'rejeitada',
        'cancelada_por_falta_de_pagamento'
      ])
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const chamadasAtivas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setChamadas(lista)
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar chamadas:', err)
        setChamadas([])
        setLoading(false)
      }
    )

    return () => unsub()
  }, [usuario?.uid])

  // 2) Atualização de status (helper)
  const atualizarChamada = async (id, dados) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), dados)
      // feedbacks amigáveis
      if (dados.status === 'checkin_freela') {
        setMensagemConfirmacao('✅ Check-in feito! Vá ao caixa/gerência para confirmar presença.')
      } else if (dados.status === 'checkout_freela') {
        setMensagemConfirmacao('✅ Check-out registrado! Aguarde a confirmação do estabelecimento.')
      } else {
        setMensagemConfirmacao(null)
      }
    } catch (err) {
      console.error('Erro ao atualizar chamada:', err)
      alert('Erro ao atualizar a chamada.')
    }
  }

  // 3) Regras: cancelar aceitas sem pagamento após 10 min (fora do render)
  useEffect(() => {
    const agora = Date.now()
    const LIMITE_MS = 10 * 60 * 1000

    const expiradas = chamadas.filter((c) => {
      if (c.status !== 'aceita') return false
      const aceitouEm = c.aceitaEm?.toMillis?.()
      if (!aceitouEm) return false
      return agora - aceitouEm > LIMITE_MS
    })

    if (expiradas.length) {
      expiradas.forEach((c) =>
        atualizarChamada(c.id, { status: 'cancelada_por_falta_de_pagamento' })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamadas])

  // 4) Ações do freela
  const aceitar = (c) =>
    atualizarChamada(c.id, { status: 'aceita', aceitaEm: serverTimestamp() })

  const rejeitar = (c) =>
    atualizarChamada(c.id, { status: 'rejeitada', rejeitadaEm: serverTimestamp() })

  const checkin = (c) =>
    atualizarChamada(c.id, {
      status: 'checkin_freela',
      checkInFreelaHora: serverTimestamp()
    })

  const checkout = (c) =>
    atualizarChamada(c.id, {
      status: 'checkout_freela',
      checkOutFreelaHora: serverTimestamp()
    })

  // 5) Render
  if (!usuario?.uid) {
    return (
      <div className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center text-orange-600 mt-10">
        🔄 Carregando chamadas...
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-2">📞 Minhas Chamadas</h1>

      {mensagemConfirmacao && (
        <div className="p-3 rounded bg-green-50 text-green-700 border border-green-200">
          {mensagemConfirmacao}
        </div>
      )}

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada encontrada.</p>
      ) : (
        chamadas.map((c) => (
          <div
            key={c.id}
            className="bg-white shadow p-4 rounded-xl border border-orange-200 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-700">
                {c.vagaTitulo || c.freelaFuncao || 'Chamada'}
              </h3>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  c.status === 'pendente'
                    ? 'bg-yellow-100 text-yellow-700'
                    : c.status === 'aceita'
                    ? 'bg-blue-100 text-blue-700'
                    : c.status === 'checkin_freela'
                    ? 'bg-indigo-100 text-indigo-700'
                    : c.status === 'checkout_freela'
                    ? 'bg-purple-100 text-purple-700'
                    : c.status === 'concluido'
                    ? 'bg-green-100 text-green-700'
                    : c.status === 'rejeitada'
                    ? 'bg-red-100 text-red-700'
                    : c.status === 'cancelada_por_falta_de_pagamento'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {String(c.status || '').replaceAll('_', ' ')}
              </span>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Estabelecimento:</strong>{' '}
                {c.estabelecimentoNome || '—'}
              </p>
              <p>
                <strong>Aberta em:</strong> {fmtData(c.criadoEm)}
              </p>
              {c.aceitaEm && (
                <p>
                  <strong>Aceita em:</strong> {fmtData(c.aceitaEm)}
                </p>
              )}
              {c.checkInFreelaHora && (
                <p>
                  <strong>Check-in:</strong> {fmtData(c.checkInFreelaHora)}
                </p>
              )}
              {c.checkOutFreelaHora && (
                <p>
                  <strong>Check-out:</strong> {fmtData(c.checkOutFreelaHora)}
                </p>
              )}
              {c.valorDiaria != null && (
                <p>
                  <strong>Valor da diária:</strong> R$ {Number(c.valorDiaria).toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>

            {/* Ações por status */}
            <div className="pt-2 flex flex-wrap gap-2">
              {c.status === 'pendente' && (
                <>
                  <button
                    onClick={() => aceitar(c)}
                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => rejeitar(c)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Rejeitar
                  </button>
                </>
              )}

              {c.status === 'aceita' && (
                <button
                  onClick={() => checkin(c)}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fazer check-in
                </button>
              )}

              {c.status === 'checkin_freela' && (
                <button
                  onClick={() => checkout(c)}
                  className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Fazer check-out
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
