import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore'

import Chat from './Chat' // Importa o componente Chat

export default function Chamadas() {
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatAbertoId, setChatAbertoId] = useState(null)
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return

    // Busca chamadas do freela com status pendente ou aceito
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', user.uid),
      where('status', 'in', ['pendente', 'aceito'])
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Aceitar chamada e abrir chat automaticamente
  async function aceitar(id) {
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: 'aceito' })
      setChatAbertoId(id)
    } catch (err) {
      console.error('Erro ao aceitar chamada:', err)
    }
  }

  // Rejeitar chamada e fechar chat se estiver aberto
  async function rejeitar(id) {
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: 'rejeitado' })
      if (chatAbertoId === id) setChatAbertoId(null)
    } catch (err) {
      console.error('Erro ao rejeitar chamada:', err)
    }
  }

  if (loading) {
    return <p className="text-center text-orange-600 mt-6">Carregando chamadas...</p>
  }

  if (chamadas.length === 0) {
    return <p className="text-center text-gray-600 mt-6">Nenhuma chamada disponível.</p>
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-semibold text-orange-700 mb-4">📞 Minhas Chamadas</h2>

      {chamadas.map(chamada => (
        <div key={chamada.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p><strong>Vaga:</strong> {chamada.vagaTitulo || 'Título não informado'}</p>
              <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome || 'Nome não informado'}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={`font-semibold ${
                    chamada.status === 'aceito'
                      ? 'text-green-600'
                      : chamada.status === 'pendente'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {chamada.status.toUpperCase()}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              {chamada.status === 'pendente' && (
                <>
                  <button
                    onClick={() => aceitar(chamada.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✅ Aceitar
                  </button>
                  <button
                    onClick={() => rejeitar(chamada.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ❌ Rejeitar
                  </button>
                </>
              )}

              {chamada.status === 'aceito' && (
                <button
                  onClick={() =>
                    setChatAbertoId(chatAbertoId === chamada.id ? null : chamada.id)
                  }
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {chatAbertoId === chamada.id ? 'Fechar Chat' : 'Abrir Chat'}
                </button>
              )}
            </div>
          </div>

          {/* Exibe o chat se estiver aberto para essa chamada */}
          {chatAbertoId === chamada.id && <Chat chamadaId={chamada.id} />}
        </div>
      ))}
    </div>
  )
}
