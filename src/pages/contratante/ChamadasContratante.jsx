import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function ChamadasContratante() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', usuario.uid),
      where('status', 'in', [
        'pendente',
        'aceita',
        'confirmada',
        'checkin_freela',
        'checkout_freela',
        'concluido'
      ])
    )

    const unsub = onSnapshot(q, async (snap) => {
      const chamadasComFreela = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const dados = docSnap.data()
          const freelaRef = doc(db, 'usuarios', dados.freelaUid)
          const freelaSnap = await getDoc(freelaRef)
          return {
            id: docSnap.id,
            ...dados,
            freela: freelaSnap.exists() ? freelaSnap.data() : null
          }
        })
      )
      setChamadas(chamadasComFreela)
    })

    return () => unsub()
  }, [usuario])

  const atualizarStatus = async (id, novoStatus) => {
    await updateDoc(doc(db, 'chamadas', id), { status: novoStatus })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">📞 Chamadas Ativas</h2>

      {chamadas.map((chamada) => (
        <div key={chamada.id} className="bg-white p-4 rounded shadow space-y-2">
          <div className="flex items-center gap-4">
            <img
              src={chamada.freela?.foto || 'https://via.placeholder.com/100'}
              alt="Foto do freela"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg">{chamada.freela?.nome || 'Freela'}</h3>
              <p className="text-sm text-gray-600">{chamada.freela?.funcao}</p>
              <p className="text-sm text-gray-600">Especialidade: {chamada.freela?.especialidade}</p>
              <p className="text-sm text-gray-600">Valor diária: R${chamada.freela?.valorDiaria}</p>
              <p className="text-sm text-gray-500">Status: {chamada.status}</p>
            </div>
          </div>

          {/* Botões dinâmicos com base no status */}
          <div className="flex flex-wrap gap-2 mt-2">
            {chamada.status === 'aceita' && (
              <button
                onClick={() => atualizarStatus(chamada.id, 'confirmada')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                ✅ Confirmar Chamada
              </button>
            )}

            {chamada.status === 'checkin_freela' && (
              <button
                onClick={() => atualizarStatus(chamada.id, 'checkin_estabelecimento')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                📍 Confirmar Check-in
              </button>
            )}

            {chamada.status === 'checkout_freela' && (
              <button
                onClick={() => atualizarStatus(chamada.id, 'concluido')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                ⏹ Confirmar Check-out
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
