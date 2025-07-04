import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

export default function HistoricoChamadasFreela({ freelaUid }) {
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!freelaUid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', freelaUid),
      where('status', '==', 'finalizado'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [freelaUid])

  const formatarData = (data) => {
    try {
      return data?.toDate().toLocaleString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">📜 Histórico de Chamadas Finalizadas</h2>
      {chamadas.length === 0 ? (
        <p className="text-gray-500">Nenhum serviço finalizado até o momento.</p>
      ) : (
        <table className="min-w-full border border-orange-200 rounded-xl overflow-hidden">
          <thead className="bg-orange-100 text-orange-800">
            <tr>
              <th className="text-left px-4 py-2">Vaga</th>
              <th className="text-left px-4 py-2">Estabelecimento</th>
              <th className="text-left px-4 py-2">Chamada</th>
              <th className="text-left px-4 py-2">Check-in</th>
              <th className="text-left px-4 py-2">Check-out</th>
            </tr>
          </thead>
          <tbody>
            {chamadas.map((chamada) => (
              <tr key={chamada.id} className="border-t hover:bg-orange-50">
                <td className="px-4 py-2">{chamada.vagaTitulo}</td>
                <td className="px-4 py-2">{chamada.estabelecimentoNome}</td>
                <td className="px-4 py-2">{formatarData(chamada.criadoEm)}</td>
                <td className="px-4 py-2">{formatarData(chamada.checkInHora)}</td>
                <td className="px-4 py-2">{formatarData(chamada.checkOutHora)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
