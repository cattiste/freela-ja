import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceito'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  async function aceitar(id) {
    setLoadingId(id)
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: 'aceito' })
    } catch (err) {
      console.error('Erro ao aceitar chamada:', err)
    }
    setLoadingId(null)
  }

  async function rejeitar(id) {
    setLoadingId(id)
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: 'rejeitado' })
    } catch (err) {
      console.error('Erro ao rejeitar chamada:', err)
    }
    setLoadingId(null)
  }

  if (loading) return <p>Carregando chamadas...</p>
  if (chamadas.length === 0) return <p>Nenhuma chamada encontrada.</p>

  return (
    <div className="space-y-4">
      {chamadas.map(chamada => (
        <div
          key={chamada.id}
          className="bg-white p-4 rounded shadow flex justify-between items-center"
        >
          <div>
            <p><strong>Vaga:</strong> {chamada.vagaTitulo || 'Sem título'}</p>
            <p><strong>Status:</strong> {chamada.status}</p>
            <p><strong>Freela:</strong> {chamada.freelaNome || 'Sem nome'}</p>
          </div>
          <div className="flex gap-2">
            {chamada.status === 'pendente' && (
              <>
                <button
                  onClick={() => aceitar(chamada.id)}
                  disabled={loadingId === chamada.id}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loadingId === chamada.id ? 'Aguarde...' : 'Aceitar'}
                </button>
                <button
                  onClick={() => rejeitar(chamada.id)}
                  disabled={loadingId === chamada.id}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loadingId === chamada.id ? 'Aguarde...' : 'Rejeitar'}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
