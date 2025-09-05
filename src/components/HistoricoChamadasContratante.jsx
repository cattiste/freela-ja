// src/pages/HistoricoChamadasContratante.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

export default function HistoricoChamadasContratante({ contratante }) {
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!contratante?.uid) return

    // Tudo que NÃO é mais “ativo” vai para o histórico
    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', contratante.uid),
      where('status', 'in', ['concluido', 'finalizada', 'cancelada', 'cancelada pelo freela']),
      orderBy('atualizadoEm', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChamadas(rows)
    })

    return () => unsub()
  }, [contratante?.uid])

  const linhas = useMemo(() => {
    const tsVal = (t) => t?.toDate?.() || null
    return [...chamadas].sort((a, b) => {
      const da = tsVal(a.pagoEm) || tsVal(a.checkoutContratanteEm) || tsVal(a.checkoutFreelaEm) || tsVal(a.atualizadoEm) || new Date(0)
      const db_ = tsVal(b.pagoEm) || tsVal(b.checkoutContratanteEm) || tsVal(b.checkoutFreelaEm) || tsVal(b.atualizadoEm) || new Date(0)
      return db_ - da
    })
  }, [chamadas])

  const fmt = (ts) => {
    try {
      const d = ts?.toDate?.()
      return d ? d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
    } catch { return '—' }
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
            <th className="px-4 py-2">Data/Hora</th>
            <th className="px-4 py-2">Valor</th>
            <th className="px-4 py-2">Pagamento</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((c) => {
            const dataRef = c.pagoEm || c.checkoutContratanteEm || c.checkoutFreelaEm || c.atualizadoEm
            const valor = typeof c.valorDiaria === 'number' ? (c.valorDiaria * 1.10) : c.valor || null // se contratante paga diária + 10%
            const pago = (String(c.pagamentoStatus || '').toLowerCase() === 'confirmado') || (String(c.status || '').toLowerCase() === 'pago')

            return (
              <tr key={c.id} className="border-t border-gray-200 hover:bg-orange-50 transition">
                <td className="px-4 py-2">{c.freelaNome || '—'}</td>
                <td className="px-4 py-2">{fmt(dataRef)}</td>
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
