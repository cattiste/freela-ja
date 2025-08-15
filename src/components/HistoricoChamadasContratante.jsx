
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function HistoricoChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['concluido', 'finalizada'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const todasChamadas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(todasChamadas)
    })

    return () => unsub()
  }, [estabelecimento])

  if (!chamadas.length) {
    return <div className="text-center mt-6 text-gray-500">Nenhuma chamada finalizada encontrada.</div>
  }

  const formatarDataHora = (timestamp) => {
    try {
      const data = timestamp?.toDate?.()
      if (!data) return '---'
      return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return '---'
    }
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
          {chamadas.map((chamada) => (
            <tr key={chamada.id} className="border-t border-gray-200 hover:bg-orange-50 transition">
              <td className="px-4 py-2">{chamada.freelaNome || '---'}</td>
              <td className="px-4 py-2">{formatarDataHora(chamada.checkOutFreelaHora || chamada.checkInFreelaHora)}</td>
              <td className="px-4 py-2">R$ {chamada.valor || '---'}</td>
              <td className="px-4 py-2">
                {chamada.statusPagamento === 'pago' ? (
                  <span className="text-green-600 font-semibold">Pago</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">Pendente</span>
                )}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">{chamada.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
