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

import Chat from './Chat'

export default function Chamadas() {
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatAbertoId, setChatAbertoId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setUser(u))
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return

    let primeiraCarga = true

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', user.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin', 'checkout'])
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      if (!primeiraCarga) {
        const chamadasPendentes = lista.filter(c => c.status === 'pendente')
        if (chamadasPendentes.length > 0) {
          const audio = new Audio('/sons/chamada.mp3')
          audio.play().catch(() => {})
        }
      }

      primeiraCarga = false
      setChamadas(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const formatarData = (data) => {
    try {
      return data?.toDate().toLocaleString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

  async function aceitar(id) {
    setLoadingId(id)
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: 'aceita' })
      setChatAbertoId(id)
    } catch (err) {
      console.error('Erro ao aceitar chamada:', err)
    }
    setLoadingId(null)
  }

  async function rejeitar(id) {
    setLoadingId(id)
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: 'rejeitado' })
      if (chatAbertoId === id) setChatAbertoId(null)
    } catch (err) {
      console.error('Erro ao rejeitar chamada:', err)
    }
    setLoadingId(null)
  }

  if (!user) {
    return <p className="text-center text-red-600 mt-6">Você precisa estar logado para ver as chamadas.</p>
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
        <div key={chamada.id} className="bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-2">
          <div className="flex justify-between items-start gap-6">
            <div className="space-y-1">
              <p><strong>Vaga:</strong> {chamada.vagaTitulo || 'Título não informado'}</p>
              <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome || 'Nome não informado'}</p>
              <p><strong>Status:</strong>{' '}
                <span className={`font-semibold ${
                  chamada.status === 'aceita'
                    ? 'text-green-600'
                    : chamada.status === 'pendente'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {chamada.status.toUpperCase()}
                </span>
              </p>
              <p><strong>Data da chamada:</strong> {formatarData(chamada.criadoEm)}</p>
              {chamada.checkInHora && (
                <p><strong>Check-in:</strong> {formatarData(chamada.checkInHora)}</p>
              )}
              {chamada.checkOutHora && (
                <p><strong>Check-out:</strong> {formatarData(chamada.checkOutHora)}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {chamada.status === 'pendente' && (
                <>
                  <button
                    onClick={() => aceitar(chamada.id)}
                    disabled={loadingId === chamada.id}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === chamada.id ? 'Aguarde...' : '✅ Aceitar'}
                  </button>
                  <button
                    onClick={() => rejeitar(chamada.id)}
                    disabled={loadingId === chamada.id}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === chamada.id ? 'Aguarde...' : '❌ Rejeitar'}
                  </button>
                </>
              )}

              {chamada.status === 'aceita' && (
                <button
                  onClick={() =>
                    setChatAbertoId(prev => (prev === chamada.id ? null : chamada.id))
                  }
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {chatAbertoId === chamada.id ? 'Fechar Chat' : 'Abrir Chat'}
                </button>
              )}
            </div>
          </div>

          {chatAbertoId === chamada.id && <Chat chamadaId={chamada.id} />}
        </div>
      ))}
    </div>
  )
}
