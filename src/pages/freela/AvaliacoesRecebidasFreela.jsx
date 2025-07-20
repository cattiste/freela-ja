import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AvaliacoesRecebidasFreela() {
  const { usuario } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'avaliacoesFreelas'),
      where('freelaUid', '==', usuario.uid)
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
  }, [usuario])

  if (!usuario?.uid) {
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
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 text-center mb-4">
        ⭐ Avaliações Recebidas
      </h1>

      {avaliacoes.length === 0 ? (
        <p className="text-center text-gray-600">
          Nenhuma avaliação recebida ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="bg-white shadow p-4 rounded-xl border">
              <p className="text-gray-800 mb-2">
                <strong>Estabelecimento:</strong>{' '}
                {avaliacao.estabelecimentoNome || '---'}
              </p>
              <p className="text-gray-600 italic">"{avaliacao.mensagem || 'Sem mensagem'}"</p>
              <p className="text-yellow-600 mt-2">⭐ Nota: {avaliacao.nota || '---'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
