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
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [usuario])

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

  if (!usuario?.uid) {
    return <div className="text-center text-red-600 mt-10">⚠️ Acesso não autorizado. Faça login novamente.</div>
  }

  if (loading) {
    return <div className="text-center text-orange-600 mt-10">🔄 Carregando chamadas...</div>
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📞 Chamadas Recentes</h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada encontrada.</p>
      ) : (
        chamadas.map((chamada) => (
          <div key={chamada.id} className="bg-white shadow p-4 rounded-xl mb-4 border border-orange-200 space-y-2">
            <h2 className="font-semibold text-orange-600 text-lg">Chamada #{chamada?.id?.slice(-5)}</h2>
            <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
            <p><strong>Status:</strong> {chamada.status}</p>

            {/* Aceitar chamada */}
            {!chamada.status || chamada.status === 'pendente' ? (
              <button
                onClick={() => atualizarChamada(chamada.id, {
                  status: 'aceita',
                  aceitaEm: serverTimestamp()
                })}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                ✅ Aceitar chamada
              </button>
            ) : null}

            {/* Fazer check-in */}
            {chamada.status === 'aceita' && !chamada.checkInFreela && (
              <button
                onClick={() => atualizarChamada(chamada.id, {
                  status: 'checkin_freela',
                  checkInFreela: true,
                  checkInFreelaHora: serverTimestamp()
                })}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
              >
                📍 Fazer check-in
              </button>
            )}

            {/* Fazer check-out */}
            {(chamada.status === 'checkin_freela' || chamada.status === 'em_andamento') && !chamada.checkOutFreela && (
              <button
                onClick={() => atualizarChamada(chamada.id, {
                  status: 'checkout_freela',
                  checkOutFreela: true,
                  checkOutFreelaHora: serverTimestamp()
                })}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition"
              >
                ⏳ Fazer check-out
              </button>
            )}

            {/* Status final */}
            {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
              <span className="text-green-600 font-bold">✅ Finalizada</span>
            )}
          </div>
        ))
      )}
    </div>
  )
}