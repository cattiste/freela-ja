
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
      where('status', 'in', ['concluido', 'finalizada', 'recusada']),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [freelaUid])

  const formatarData = (timestamp) => {
    try {
      return timestamp?.toDate().toLocaleString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4 text-orange-700">📜 Histórico de Chamadas</h2>
      {chamadas.length === 0 ? (
        <p className="text-gray-500">Nenhum serviço finalizado ou recusado até o momento.</p>
      ) : (
        <table className="min-w-full border border-orange-200 rounded-xl overflow-hidden bg-white shadow">
          <thead className="bg-orange-100 text-orange-800">
            <tr>
              <th className="text-left px-4 py-2">Vaga</th>
              <th className="text-left px-4 py-2">Contratante</th>
              <th className="text-left px-4 py-2">Chamada</th>
              <th className="text-left px-4 py-2">Check-in</th>
              <th className="text-left px-4 py-2">Check-out</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {chamadas.map((chamada) => (
              <tr key={chamada.id} className="border-t hover:bg-orange-50">
                <td className="px-4 py-2">{chamada.vagaTitulo || '—'}</td>
                <td className="px-4 py-2">{chamada.contratanteNome || '—'}</td>
                <td className="px-4 py-2">{formatarData(chamada.criadoEm)}</td>
                <td className="px-4 py-2">{formatarData(chamada.checkInFreelaHora)}</td>
                <td className="px-4 py-2">{formatarData(chamada.checkOutFreelaHora)}</td>
                <td className="px-4 py-2 capitalize">{chamada.status || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
