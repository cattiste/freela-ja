// src/pages/freela/ChamadasFreela.jsx
import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

const STATUS_ATIVAS = ['pendente', 'aceita', 'checkin_freela', 'checkin_estabelecimento', 'checkout_freela']

export default function ChamadasFreela({ freelaUid: freelaUidProp, freela }) {
  const { usuario } = useAuth()
  const freelaUid = freelaUidProp || usuario?.uid

  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!freelaUid) return
    setLoading(true)
    setErro('')

    // ⚠️ se der erro pedindo índice, o catch abaixo vai logar no console
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', freelaUid),
      where('status', 'in', STATUS_ATIVAS),
      orderBy('criadoEm', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setChamadas(docs)
        setLoading(false)
      },
      (err) => {
        console.error('[ChamadasFreela] onSnapshot erro:', err)
        setErro('Falha ao carregar suas chamadas.')
        setLoading(false)
      }
    )

    return () => unsub()
  }, [freelaUid])

  // 🔒 nunca use 'lista' sem declarar — derive daqui
  const lista = Array.isArray(chamadas) ? chamadas : []

  if (loading) return <div className="p-4">Carregando chamadas…</div>
  if (erro) return <div className="p-4 text-red-600">{erro}</div>

  if (lista.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        Nenhuma chamada ativa no momento.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {lista.map((c) => (
        <div key={c.id} className="bg-white rounded-xl shadow p-3 border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.estabelecimentoNome || 'Estabelecimento'}</div>
              <div className="text-sm text-gray-600">
                Função: {c.funcao || '—'} {c.especialidade ? `• ${c.especialidade}` : ''}
              </div>
              <div className="text-xs text-gray-500">
                Status: <span className="uppercase">{c.status}</span>
              </div>
            </div>
            <div className="text-right text-sm">
              {c.valorDiaria ? `R$ ${Number(c.valorDiaria).toFixed(2)}` : ''}
            </div>
          </div>

          {/* Botões básicos (ajuste conforme sua lógica atual) */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {c.status === 'pendente' && (
              <>
                <button className="px-3 py-1 rounded bg-green-600 text-white">Aceitar</button>
                <button className="px-3 py-1 rounded bg-gray-300">Rejeitar</button>
              </>
            )}

            {['aceita', 'checkin_estabelecimento'].includes(c.status) && (
              <button className="px-3 py-1 rounded bg-blue-600 text-white">Fazer Check-in</button>
            )}

            {['checkin_freela'].includes(c.status) && (
              <button className="px-3 py-1 rounded bg-orange-600 text-white">Fazer Check-out</button>
            )}
          </div>

          {c.observacao && (
            <div className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Observação:</span> {c.observacao}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
