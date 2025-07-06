import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import Chat from './Chat'
import { toast } from 'react-hot-toast'

export default function Chamadas() {
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatAbertoId, setChatAbertoId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState({})
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
      where('status', 'in', ['pendente', 'aceita', 'checkin', 'checkout', 'finalizado'])
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

  async function enviarAvaliacao(chamadaId, estabelecimentoUid, nota, comentario) {
    try {
      await addDoc(collection(db, 'avaliacoesEstabelecimentos'), {
        chamadaId,
        estabelecimentoUid,
        freelaUid: user.uid,
        nota,
        comentario,
        dataCriacao: serverTimestamp()
      })

      await updateDoc(doc(db, 'chamadas', chamadaId), {
        avaliacaoFreelaFeita: true
      })

      toast.success('Avaliação enviada com sucesso!')
      setAvaliacoes((prev) => ({ ...prev, [chamadaId]: { nota, comentario } }))
    } catch (err) {
      toast.error('Erro ao enviar avaliação.')
      console.error(err)
    }
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
    <div className="max-w-4xl mx-auto mt-6 space-y-4">
      <h2 className="text-xl font-bold text-orange-700 mb-3">📞 Minhas Chamadas</h2>

      {chamadas.map(chamada => (
        <div
          key={chamada.id}
          className="bg-white p-4 rounded-xl shadow-sm border border-orange-200 space-y-3"
        >
          <div className="flex justify-between items-start gap-4 text-sm">
            <div>
              <p><strong>{chamada.vagaTitulo}</strong></p>
              <p className="text-gray-600">{chamada.estabelecimentoNome}</p>
              <p>
                <strong>Status: </strong>
                <span className={`font-bold ${
                  chamada.status === 'aceita'
                    ? 'text-green-600'
                    : chamada.status === 'pendente'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {chamada.status.toUpperCase()}
                </span>
              </p>
              <p className="text-gray-500">{formatarData(chamada.criadoEm)}</p>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              {chamada.status === 'pendente' && (
                <>
                  <button
                    onClick={() => aceitar(chamada.id)}
                    disabled={loadingId === chamada.id}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingId === chamada.id ? 'Aguarde...' : '✅ Aceitar'}
                  </button>
                  <button
                    onClick={() => rejeitar(chamada.id)}
                    disabled={loadingId === chamada.id}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
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
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  {chatAbertoId === chamada.id ? 'Fechar Chat' : 'Abrir Chat'}
                </button>
              )}
            </div>
          </div>

          {chatAbertoId === chamada.id && (
            <div className="w-full mt-2">
              <Chat chamadaId={chamada.id} />
            </div>
          )}

          {/* Avaliação embutida */}
          {chamada.checkOutHora &&
            chamada.status === 'finalizado' &&
            !chamada.avaliacaoFreelaFeita && (
              <div className="mt-3 border-t pt-3">
                <h3 className="text-sm font-semibold mb-1">📝 Avalie o estabelecimento</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const nota = parseInt(e.target.nota.value)
                    const comentario = e.target.comentario.value
                    enviarAvaliacao(chamada.id, chamada.estabelecimentoUid, nota, comentario)
                  }}
                  className="flex flex-col gap-2"
                >
                  <label className="text-sm">
                    Nota:
                    <select name="nota" className="ml-2 border p-1 rounded text-sm">
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <textarea
                    name="comentario"
                    placeholder="Comentário"
                    className="border p-2 rounded text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    Enviar Avaliação
                  </button>
                </form>
              </div>
          )}
        </div>
      ))}
    </div>
  )
}
