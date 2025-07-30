import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid)
    )

    const unsubscribe = onSnapshot(q, async (snap) => {
      const chamadasCompletas = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const chamada = { id: docSnap.id, ...docSnap.data() }

          let estabelecimento = null
          if (chamada.estabelecimentoUid) {
            const estRef = doc(db, 'usuarios', chamada.estabelecimentoUid)
            const estSnap = await getDoc(estRef)
            if (estSnap.exists()) {
              estabelecimento = estSnap.data()
            }
          }

          return { ...chamada, estabelecimento }
        })
      )

      setChamadas(chamadasCompletas)
    })

    return () => unsubscribe()
  }, [usuario])

  if (!usuario) return <p className="text-center mt-8">Usuário não autenticado.</p>
  if (chamadas.length === 0) return <p className="text-center mt-8">Nenhuma chamada encontrada.</p>

  return (
    <div className="space-y-4">
      {chamadas.map((chamada) => (
        <div key={chamada.id} className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-orange-600">
                Estabelecimento: {chamada.estabelecimento?.nome || '—'}
              </p>
              <p className="text-sm text-gray-600">
                Endereço: {chamada.estabelecimento?.endereco || '—'}
              </p>
            </div>
            <span className="text-xs text-gray-500">Status: {chamada.status}</span>
          </div>

          {chamada.vagaTitulo && (
            <p className="mt-2 text-sm">
              <strong>Vaga:</strong> {chamada.vagaTitulo}
            </p>
          )}

          {chamada.valorNegociado && (
            <p className="text-sm text-green-700">
              <strong>Valor negociado:</strong> R$ {chamada.valorNegociado}
            </p>
          )}

          {chamada.status === 'checkin_freela' && (
            <p className="mt-2 text-sm text-yellow-600">
              ⏳ Aguardando check-out do estabelecimento.
            </p>
          )}

          {chamada.status === 'checkout_freela' && (
            <p className="mt-2 text-sm text-yellow-600">
              ⏳ Aguardando confirmação de finalização.
            </p>
          )}

          {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
            <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
          )}
        </div>
      ))}
    </div>
  )
}
