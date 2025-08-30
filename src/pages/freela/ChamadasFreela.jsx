// ✅ ChamadasFreela.jsx - atualizado com fluxo restaurado
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
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', 'in', [
        'pendente',
        'aceita',
        'confirmada',
        'pago',
        'checkin_confirmado',
        'em_andamento',
        'checkout_feito',
        'concluido',
      ])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = []
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [usuario?.uid])

  const aceitarChamada = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'aceita',
      aceitaHora: serverTimestamp(),
    })
  }

  const rejeitarChamada = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'rejeitada',
      rejeitadaHora: serverTimestamp(),
    })
  }

  const fazerCheckIn = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'checkin_feito',
      checkinHora: serverTimestamp(),
    })
  }

  const fazerCheckOut = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'checkout_feito',
      checkoutHora: serverTimestamp(),
    })
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 mb-4 text-center">📱 Chamadas Recebidas</h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma chamada recebida ainda.</p>
      ) : (
        chamadas.map((chamada) => (
          <div key={chamada.id} className="bg-white rounded-xl shadow p-4 mb-4 space-y-2 border border-orange-300">
            <h2 className="text-lg font-bold text-orange-600">Chamada #{chamada.id.slice(-5)}</h2>
            <p><strong>Contratante:</strong> {chamada.contratanteNome || chamada.contratanteUid}</p>
            <p><strong>Status:</strong> {chamada.status}</p>
            <p><strong>Valor da diária:</strong> R$ {chamada.valorDiaria?.toFixed(2) || '---'}</p>
            {chamada.observacao && <p><strong>📄 Observação:</strong> {chamada.observacao}</p>}

            <div className="flex flex-col sm:flex-row gap-2">
              {chamada.status === 'pendente' && (
                <>
                  <button
                    onClick={() => aceitarChamada(chamada.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => rejeitarChamada(chamada.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Rejeitar
                  </button>
                </>
              )}

              {chamada.status === 'confirmada' && (
                <button
                  onClick={() => fazerCheckIn(chamada.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Fazer Check-in
                </button>
              )}

              {chamada.status === 'em_andamento' && (
                <button
                  onClick={() => fazerCheckOut(chamada.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Fazer Check-out
                </button>
              )}
            </div>

            <RespostasRapidasFreela chamadaId={chamada.id} />
            <AvaliacaoInline tipo="freela" chamada={chamada} />
          </div>
        ))
      )}
    </div>
  )
}
