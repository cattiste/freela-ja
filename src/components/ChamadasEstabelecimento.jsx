import React, { useEffect, useState, useRef } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

// Som de notificação - pode ser um arquivo mp3 local ou URL
const somNotificacaoUrl = '/sons/chamada.mp3' // ajuste o caminho conforme seu projeto

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState(null)
  const audioRef = useRef(null)

  // Tocar som ao detectar nova chamada pendente
  useEffect(() => {
    if (!audioRef.current) return

    // Se existir alguma chamada pendente, toca som
    const pendentes = chamadas.filter(chamada => chamada.status === 'pendente')
    if (pendentes.length > 0) {
      audioRef.current.play().catch(() => {
        // Pode falhar se o usuário não interagiu com a página ainda
      })
    }
  }, [chamadas])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceito', 'checkin', 'checkout'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  async function atualizarStatus(id, statusAtual, novoStatus) {
    setLoadingId(id)
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: novoStatus })

      // Se quiser também atualizar os timestamps aqui, você pode adicionar mais campos no update
    } catch (err) {
      console.error(`Erro ao atualizar chamada ${id}:`, err)
      alert('Erro ao atualizar chamada.')
    }
    setLoadingId(null)
  }

  if (loading) return <p>Carregando chamadas...</p>
  if (chamadas.length === 0) return <p>Nenhuma chamada encontrada.</p>

  return (
    <>
      <audio ref={audioRef} src={somNotificacaoUrl} preload="auto" />

      <div className="space-y-4">
        {chamadas.map(chamada => (
          <div
            key={chamada.id}
            className="bg-white p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <p><strong>Vaga:</strong> {chamada.vagaTitulo || 'Sem título'}</p>
              <p><strong>Status:</strong> {chamada.status}</p>
              <p><strong>Freela:</strong> {chamada.freelaNome || 'Sem nome'}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {chamada.status === 'pendente' && (
                <>
                  <button
                    onClick={() => atualizarStatus(chamada.id, chamada.status, 'aceito')}
                    disabled={loadingId === chamada.id}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingId === chamada.id ? 'Aguarde...' : 'Aceitar'}
                  </button>
                  <button
                    onClick={() => atualizarStatus(chamada.id, chamada.status, 'rejeitado')}
                    disabled={loadingId === chamada.id}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {loadingId === chamada.id ? 'Aguarde...' : 'Rejeitar'}
                  </button>
                </>
              )}

              {chamada.status === 'aceito' && (
                <button
                  onClick={() => atualizarStatus(chamada.id, chamada.status, 'checkin')}
                  disabled={loadingId === chamada.id}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingId === chamada.id ? 'Aguarde...' : 'Confirmar Check-in'}
                </button>
              )}

              {chamada.status === 'checkin' && (
                <button
                  onClick={() => atualizarStatus(chamada.id, chamada.status, 'checkout')}
                  disabled={loadingId === chamada.id}
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingId === chamada.id ? 'Aguarde...' : 'Confirmar Check-out'}
                </button>
              )}

              {chamada.status === 'checkout' && (
                <span className="text-green-600 font-semibold">Serviço finalizado</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
