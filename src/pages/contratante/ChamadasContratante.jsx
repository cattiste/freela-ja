// src/pages/contratante/ChamadasContratante.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import MensagensRecebidasContratante from '@/components/MensagensRecebidasContratante'

export default function ChamadasContratante() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', usuario.uid),
      where('status', 'in', [
        'aceita',
        'confirmada',
        'checkin_freela',
        'em_andamento',
        'checkout_freela',
        'concluido',
        'finalizada'
      ])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setChamadas(docs)
    })

    return () => unsubscribe()
  }, [usuario?.uid])

  async function confirmarCheckin(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'em_andamento',
        checkInConfirmadoPeloContratante: true,
        checkInConfirmadoPeloContratanteHora: serverTimestamp(),
      })
      toast.success('✅ Check-in confirmado!')
    } catch (e) {
      console.error('Erro ao confirmar check-in:', e)
      toast.error('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckout(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'finalizada',
        checkOutConfirmadoPeloContratante: true,
        checkOutConfirmadoPeloContratanteHora: serverTimestamp(),
      })
      toast.success('🏁 Check-out confirmado!')
    } catch (e) {
      console.error('Erro ao confirmar check-out:', e)
      toast.error('Erro ao confirmar check-out.')
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 text-center mb-4">
        📋 Chamadas em Andamento
      </h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma chamada em andamento.</p>
      ) : (
        chamadas.map((ch) => (
          <div key={ch.id} className="bg-white border rounded-xl shadow p-4 mb-4 space-y-2">
            <h2 className="font-semibold text-blue-600 text-lg">
              Chamada #{ch.id.slice(-5)}
            </h2>
            <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
            <p><strong>Status:</strong> {ch.status}</p>
            {typeof ch.valorDiaria === 'number' && (
              <p><strong>Valor da diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
            )}
            {ch.observacao && (
              <p><strong>📝 Observação:</strong> {ch.observacao}</p>
            )}

            {/* Botões de ação por status */}
            {ch.status === 'checkin_freela' && !ch.checkInConfirmadoPeloContratante && (
              <button
                onClick={() => confirmarCheckin(ch)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                ✅ Confirmar Check-in
              </button>
            )}

            {ch.status === 'checkout_freela' && !ch.checkOutConfirmadoPeloContratante && (
              <button
                onClick={() => confirmarCheckout(ch)}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                🏁 Confirmar Check-out
              </button>
            )}

            {ch.status === 'finalizada' && (
              <AvaliacaoFreela chamada={ch} />
            )}

            <MensagensRecebidasContratante chamadaId={ch.id} />

            {(ch.status === 'finalizada' || ch.status === 'concluido') && (
              <span className="text-green-700 font-bold block text-center mt-2">
                ✅ Finalizada
              </span>
            )}
          </div>
        ))
      )}
    </div>
  )
}
