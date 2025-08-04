import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

export default function DashboardAdmin() {
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'chamadas'), orderBy('criadoEm', 'desc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 mb-6 text-center">Painel Administrativo</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow border border-orange-200">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Chamadas totais</h2>
          <p className="text-3xl text-orange-600">{chamadas.length}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border border-orange-200">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Ativas no momento</h2>
          <p className="text-3xl text-orange-600">
            {chamadas.filter(c => ['aceita','pago','checkin_freela','em_andamento','checkout_freela'].includes(c.status)).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 border border-orange-200">
        <h2 className="text-xl font-semibold text-orange-700 mb-3">Chamadas Recentes</h2>
        <div className="divide-y">
          {chamadas.slice(0, 10).map((chamada) => (
            <div key={chamada.id} className="py-2">
              <p className="text-sm">
                <strong>ID:</strong> {chamada.id.slice(-6)} | <strong>Status:</strong> {chamada.status} |{' '}
                <strong>Freela:</strong> {chamada.freelaNome || '---'} |{' '}
                <strong>Estab:</strong> {chamada.estabelecimentoNome || '---'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}