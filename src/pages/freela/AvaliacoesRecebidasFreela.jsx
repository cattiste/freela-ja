import React, { useEffect, useState } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'

export default function AvaliacoesRecebidasFreela({ freelaUid }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!freelaUid) return

    const q = query(
      collection(db, 'avaliacoesFreelas'),
      where('freelaUid', '==', freelaUid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAvaliacoes(lista)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [freelaUid])

  if (!freelaUid) {
    return (
      <div className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="text-center text-orange-600 mt-10">
        🔄 Carregando avaliações recebidas...
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow col-span-1">
      <h1 className="text-xl font-bold text-blue-700 mb-4 text-center">
        ⭐ Avaliações Recebidas
      </h1>

      {avaliacoes.length === 0 ? (
        <p className="text-center text-gray-600">
          Nenhuma avaliação recebida ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="bg-gray-50 border p-3 rounded-xl shadow-sm">
              <p className="text-sm text-gray-800">
                <strong>Estabelecimento:</strong>{' '}
                {avaliacao.estabelecimentoNome || '---'}
              </p>
              <p className="text-sm text-gray-600 italic">
                "{avaliacao.mensagem || 'Sem mensagem'}"
              </p>
              <p className="text-yellow-600 mt-1">⭐ Nota: {avaliacao.nota || '---'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
