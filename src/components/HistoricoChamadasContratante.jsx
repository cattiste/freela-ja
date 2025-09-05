// src/pages/HistoricoChamadasContratante.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function HistoricoChamadasContratante({ contratante }) {
  const { usuario } = useAuth()
  const estab = contratante || usuario
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!estab?.uid) return
    setLoading(true)

    // Tudo que NÃO é mais “ativo” vai para o histórico
    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', estab.uid),
      where('status', 'in', ['concluido', 'finalizada', 'cancelada', 'cancelada pelo freela']),
      orderBy('atualizadoEm', 'desc') // precisa do índice composto
    )

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setRows(docs)
      setLoading(false)
    }, (err) => {
      console.error('[HistoricoChamadasContratante] onSnapshot:', err)
      setRows([])
      setLoading(false)
    })

    return () => unsub()
  }, [estab?.uid])

  const linhas = useMemo(() => {
    // já vem ordenado, mas garantimos:
    const ts = (d) => d?.toMillis?.() ?? (d?.seconds ? d.seconds * 1000 : 0)
    return [...rows].sort((a, b) => ts(b.atualizadoEm) - ts(a.atualizadoEm))
  }, [rows])

  const fmt = (ts) => {
    try {
      const d = ts?.toDate?.()
      return d ? d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
    } catch { return '—' }
  }

  if (loading) {
    return <div className="text-center mt-6 text-gray-500">🔄 Carregando histórico…</div>
  }

  if (!linhas.length) {
    return <div className="text-center mt-6 text-gray-500">Nenhuma chamada em histórico.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-xl overflow-hidden">
        <thead className="bg-orange-100 text-orange-800 text-left">
          <tr>
            <th className="px-4 py-2">Freela</th>
            <th className="px-4 py-2">Atualizado em</th>
            <th className="px-4 py-2">Valor</th>
            <th className="px-4 py-2">Pagamento</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((c) => {
            const valor = typeof c.valorDiaria === 'number' ? (c.valorDiaria * 1.10) : c.valor || null // se contratante paga diária + 10%
            const pago = (
              String(c.pagamentoStatus || '').toLowerCase() === 'confirmado' ||
              String(c.status || '').toLowerCase() === 'pago'
            )

            return (
              <tr key={c.id} className="border-t border-gray-200 hover:bg-orange-50 transition">
                <td className="px-4 py-2">{c.freelaNome || '—'}</td>
                <td className="px-4 py-2">{fmt(c.atualizadoEm || c.pagoEm || c.checkoutContratanteEm || c.checkoutFreelaEm)}</td>
                <td className="px-4 py-2">{valor ? `R$ ${valor.toFixed(2)}` : '—'}</td>
                <td className="px-4 py-2">
                  {pago ? (
                    <span className="text-green-600 font-semibold">Pago</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">Pendente/Cancelado</span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">{c.status}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
