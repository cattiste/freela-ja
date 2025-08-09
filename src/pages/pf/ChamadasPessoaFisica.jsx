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
import MensagensRecebidasPF from '@/components/MensagensRecebidasPF'

export default function ChamadasPessoaFisica({ pessoaFisica }) {
  const [chamadas, setChamadas] = useState([])
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (!pessoaFisica?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('pessoaFisicaUid', '==', pessoaFisica.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'em_andamento', 'checkout_freela', 'concluido'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const todasChamadas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(todasChamadas)
    })

    return () => unsub()
  }, [pessoaFisica])

  const atualizarChamada = async (id, dados) => {
    try {
      setLoadingId(id)
      await updateDoc(doc(db, 'chamadas', id), dados)
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
      concluido: 'bg-gray-200 text-gray-700'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cores[status] || 'bg-gray-200 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (!chamadas.length) {
    return <div className="text-center mt-6 text-gray-500">Nenhuma chamada ativa no momento.</div>
  }

  return (
    <div className="space-y-4">
      {chamadas.map((chamada) => {
        const foto = chamada.freelaFoto || chamada.freela?.foto || 'https://placehold.co/100x100'
        const nome = chamada.freelaNome || chamada.freela?.nome || 'Nome não informado'

        return (
          <div key={chamada.id} className="bg-white rounded-xl p-3 shadow border border-orange-100 space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={foto}
                alt={nome}
                className="w-10 h-10 rounded-full border border-orange-300 object-cover"
              />
              <div className="flex-1">
                <p className="font-bold text-orange-600">{nome}</p>
                {chamada.valorDiaria && (
                  <p className="text-xs text-gray-500">💰 R$ {chamada.valorDiaria} / diária</p>
                )}
                <p className="text-sm mt-1">📌 Status: {badgeStatus(chamada.status)}</p>
                {/* FIX: componente correto */}
                <MensagensRecebidasPF />
              </div>
            </div>

            {chamada.checkInFreela === true && !chamada.checkInPessoaFisica && (
              <button
                onClick={() =>
                  atualizarChamada(chamada.id, {
                    checkInPessoaFisica: true,
                    checkInPessoaFisicaHora: serverTimestamp(),
                    status: 'em_andamento'
                  })
                }
                disabled={loadingId === chamada.id}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar Check-in'}
              </button>
            )}

            {chamada.checkOutFreela === true && !chamada.checkOutPessoaFisica && (
              <button
                onClick={() =>
                  atualizarChamada(chamada.id, {
                    checkOutPessoaFisica: true,
                    checkOutPessoaFisicaHora: serverTimestamp(),
                    status: 'concluido'
                  })
                }
                disabled={loadingId === chamada.id}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '📤 Confirmar Check-out'}
              </button>
            )}

            {chamada.status === 'concluido' && (
              <AvaliacaoInline chamada={chamada} tipo="pessoaFisica" />
            )}
          </div>
        )
      })}
    </div>
  )
}
