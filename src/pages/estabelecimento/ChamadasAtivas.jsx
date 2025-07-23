
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasAtivas({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const todasChamadas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Deduplicação por freelaUid
      const unicas = {}
      todasChamadas.forEach((chamada) => {
        const existente = unicas[chamada.freelaUid]
        const novaData = chamada.criadoEm?.toMillis?.() || 0
        const dataExistente = existente?.criadoEm?.toMillis?.() || 0

        if (!existente || novaData > dataExistente) {
          unicas[chamada.freelaUid] = chamada
        }
      })

      setChamadas(Object.values(unicas))
    })

    return () => unsub()
  }, [estabelecimento])

  const confirmarCheck = async (chamada, tipo) => {
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      if (tipo === 'checkin') {
        await updateDoc(ref, { checkInEstabelecimento: true })
        alert('✅ Check-in confirmado com sucesso.')
      } else if (tipo === 'checkout') {
        await updateDoc(ref, { checkOutEstabelecimento: true, status: 'concluido' })
        alert('✅ Check-out confirmado e chamado finalizado.')
      }
    } catch (err) {
      console.error('Erro ao confirmar:', err)
      alert('Erro ao confirmar ação.')
    }
  }

  if (!chamadas.length) {
    return <div className="text-center mt-6 text-gray-500">Nenhuma chamada ativa no momento.</div>
  }

  return (
    <div className="space-y-3">
      {chamadas.map((chamada) => (
        <div key={chamada.id} className="p-3 bg-white rounded-xl shadow border border-orange-100">
          <p className="text-orange-600 font-bold">Chamada #{chamada.codigo || chamada.id.slice(-5)}</p>
          <p className="text-sm">👤 {chamada.freelaNome}</p>
          <p className="text-sm">📌 Status: {chamada.status}</p>

          {chamada.status === 'aceita' && chamada.checkInEstabelecimento !== true && (
            <button
              onClick={() => confirmarCheck(chamada, 'checkin')}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              ✅ Confirmar Check-in
            </button>
          )}

          {chamada.status === 'checkout_freela' && chamada.checkOutEstabelecimento !== true && (
            <button
              onClick={() => confirmarCheck(chamada, 'checkout')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📤 Confirmar Check-out
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
