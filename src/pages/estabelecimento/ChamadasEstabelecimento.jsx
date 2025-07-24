import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid)
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setChamadas(lista)
      setCarregando(false)
    }, err => {
      console.error('Erro ao buscar chamadas:', err)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  const atualizarChamada = async (id, dados) => {
    try {
      const ref = doc(db, 'chamadas', id)
      await updateDoc(ref, dados)
      toast.success('✅ Ação realizada com sucesso!')
    } catch (err) {
      console.error('Erro ao atualizar chamada:', err)
      toast.error('Erro ao atualizar chamada.')
    }
  }

  if (carregando) return <p className="text-center text-orange-600">🔄 Carregando chamadas...</p>
  if (chamadas.length === 0) return <p className="text-center text-gray-600">📭 Nenhuma chamada registrada.</p>

  return (
    <div className="space-y-3">
      {chamadas.map(chamada => (
        <div key={chamada.id} className="p-3 bg-white rounded-xl shadow border border-orange-100 space-y-2">
          <p className="text-orange-600 font-bold">Chamada #{chamada.id.slice(-5)}</p>
          <p className="text-sm">👤 Freela: {chamada.freelaNome}</p>
          <p className="text-sm">📌 Status: {chamada.status}</p>

          <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
            checkInFreela: {chamada.checkInFreela?.toString()} |
            checkInEstabelecimento: {chamada.checkInEstabelecimento?.toString()} |
            checkOutFreela: {chamada.checkOutFreela?.toString()} |
            checkOutEstabelecimento: {chamada.checkOutEstabelecimento?.toString()} |
            status: {chamada.status}
          </pre>

          {/* Confirmar Check-in apenas quando status for checkin_freela */}
          {chamada.status === 'checkin_freela' && !chamada.checkInEstabelecimento && (
            <button
              onClick={() => atualizarChamada(chamada.id, {
                checkInEstabelecimento: true,
                checkInEstabelecimentoHora: serverTimestamp(),
                status: 'em_andamento'
              })}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              ✅ Confirmar Check-in
            </button>
          )}

          {/* Confirmar Check-out apenas quando status for checkout_freela */}
          {chamada.status === 'checkout_freela' && !chamada.checkOutEstabelecimento && (
            <button
              onClick={() => atualizarChamada(chamada.id, {
                checkOutEstabelecimento: true,
                checkOutEstabelecimentoHora: serverTimestamp(),
                status: 'concluido'
              })}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              📤 Confirmar Check-out
            </button>
          )}

          {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
            <span className="text-green-600 font-bold">✅ Finalizada</span>
          )}
        </div>
      ))}
    </div>
  )
}