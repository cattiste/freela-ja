import React, { useEffect, useState, useRef } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import useOnlineStatus from '@/hooks/useOnlineStatus'

import HistoricoChamadasFreela from '@/components/HistoricoChamadasFreela'
import Chat from './freelas/Chat'

export default function PainelFreela() {
  const user = auth.currentUser
  const uid = user?.uid
  const { online, loading: onlineLoading } = useOnlineStatus(uid)

  const [aba, setAba] = useState('chamadas')
  const [chamadas, setChamadas] = useState([])
  const [chamadaAtiva, setChamadaAtiva] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!uid) return

    // Query para chamadas pendentes e em andamento
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', uid),
      where('status', 'in', ['pendente', 'em_andamento']),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      setChamadas(lista)

      // Se tiver chamada pendente, define a primeira como ativa para notificação
      const pendente = lista.find(c => c.status === 'pendente')
      setChamadaAtiva(pendente || null)
    })

    return () => unsubscribe()
  }, [uid])

  // Toca som quando tiver chamada pendente nova
  useEffect(() => {
    if (chamadaAtiva && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Não bloquear se autoplay for bloqueado
      })
    }
  }, [chamadaAtiva])

  const recusarChamada = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'recusada',
      })
      setChamadaAtiva(null)
      setAba('historico') // Muda para aba histórico após recusar
    } catch (err) {
      console.error('Erro ao recusar chamada:', err)
      alert('Erro ao recusar a chamada.')
    }
  }

  const aceitarChamada = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'em_andamento',
        aceitaEm: new Date()
      })
      setChamadaAtiva(null)
      // Aqui pode mudar aba para chat ou manter na chamadas
    } catch (err) {
      console.error('Erro ao aceitar chamada:', err)
      alert('Erro ao aceitar a chamada.')
    }
  }

  if (onlineLoading) {
    return <p>Verificando status online...</p>
  }

  if (!uid) {
    return <p>Usuário não autenticado.</p>
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 max-w-7xl mx-auto">
      <audio ref={audioRef} src="/sounds/chamada.mp3" preload="auto" />

      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-700">Painel do Freelancer</h1>
        <nav className="space-x-4">
          <button
            className={`px-4 py-2 rounded font-semibold ${aba === 'chamadas' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setAba('chamadas')}
          >
            Chamadas
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${aba === 'historico' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setAba('historico')}
          >
            Histórico
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${aba === 'chat' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setAba('chat')}
          >
            Chat
          </button>
        </nav>
      </header>

      {aba === 'chamadas' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Chamadas Pendentes e em Andamento</h2>

          {chamadas.length === 0 && <p>Nenhuma chamada no momento.</p>}

          <ul className="space-y-4">
            {chamadas.map((chamada) => (
              <li key={chamada.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <p><strong>Vaga:</strong> {chamada.vagaTitulo}</p>
                  <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
                  <p><strong>Status:</strong> {chamada.status}</p>
                </div>
                {chamada.status === 'pendente' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => aceitarChamada(chamada.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => recusarChamada(chamada.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Recusar
                    </button>
                  </div>
                )}
                {chamada.status === 'em_andamento' && (
                  <span className="text-green-600 font-semibold">Em andamento</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {aba === 'historico' && <HistoricoChamadasFreela freelaUid={uid} />}

      {aba === 'chat' && <Chat freelaUid={uid} />}
    </div>
  )
}
