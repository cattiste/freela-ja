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
import AvaliacaoInline from '@/components/AvaliacaoInline'
import ChatInline from '@/components/ChatInline'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [loadingId, setLoadingId] = useState(null)

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
      setLoadingId(id)
      const ref = doc(db, 'chamadas', id)
      await updateDoc(ref, dados)
      toast.success('✅ Ação realizada com sucesso!')
    } catch (err) {
      console.error('Erro ao atualizar chamada:', err)
      toast.error('Erro ao atualizar chamada.')
    } finally {
      setLoadingId(null)
    }
  }

  const badgeStatus = (status) => {
    const cores = {
      aceita: 'bg-yellow-200 text-yellow-700',
      checkin_freela: 'bg-purple-200 text-purple-700',
      em_andamento: 'bg-green-200 text-green-700',
      checkout_freela: 'bg-blue-200 text-blue-700',
      concluido: 'bg-green-100 text-green-600',
      finalizada: 'bg-gray-200 text-gray-600',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cores[status] || 'bg-gray-200 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (carregando) return <p className="text-center text-orange-600">🔄 Carregando chamadas...</p>
  if (chamadas.length === 0) return <p className="text-center text-gray-600">📭 Nenhuma chamada registrada.</p>

  return (
    <div className="space-y-3">
      {chamadas.map(chamada => (
        <div key={chamada.id} className="p-3 bg-white rounded-xl shadow border border-orange-100 space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={chamada.freelaFoto || 'https://via.placeholder.com/40'}
              alt={chamada.freelaNome}
              className="w-10 h-10 rounded-full border border-orange-300 object-cover"
            />
            <div className="flex-1">
              <p className="font-bold text-orange-600">{chamada.freelaNome}</p>
              {chamada.valorDiaria && (
                <p className="text-xs text-gray-500">💰 R$ {chamada.valorDiaria} / diária</p>
              )}
              <p className="text-sm mt-1">📌 Status: {badgeStatus(chamada.status)}</p>
              <ChatInline chamadaId={chamada.id} />
            </div>
          </div>

          <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-wrap">
checkInFreela: {chamada.checkInFreela?.toString()} | checkInEstabelecimento: {chamada.checkInEstabelecimento?.toString()} |
checkOutFreela: {chamada.checkOutFreela?.toString()} | checkOutEstabelecimento: {chamada.checkOutEstabelecimento?.toString()}
          </pre>

          {/* Confirmar Check-in */}
          {chamada.status === 'checkin_freela' && !chamada.checkInEstabelecimento && (
            <button
              onClick={() => atualizarChamada(chamada.id, {
                checkInEstabelecimento: true,
                checkInEstabelecimentoHora: serverTimestamp(),
                status: 'em_andamento'
              })}
              disabled={loadingId === chamada.id}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar Check-in'}
            </button>
          )}

          {/* Confirmar Check-out */}
          {chamada.status === 'checkout_freela' && !chamada.checkOutEstabelecimento && (
            <button
              onClick={() => atualizarChamada(chamada.id, {
                checkOutEstabelecimento: true,
                checkOutEstabelecimentoHora: serverTimestamp(),
                status: 'concluido'
              })}
              disabled={loadingId === chamada.id}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loadingId === chamada.id ? 'Confirmando...' : '📤 Confirmar Check-out'}
            </button>
          )}

          {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
            <>
              <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
              {!chamada.avaliacaoFreelaFeita ? (
                <AvaliacaoInline chamada={chamada} tipo="estabelecimento" />
              ) : (
                <p className="text-sm text-gray-500 text-center">Freelancer já avaliado ✅</p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
