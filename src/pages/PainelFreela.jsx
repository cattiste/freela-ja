import React, { useEffect, useState, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useNavigate } from 'react-router-dom'

import AgendaFreela from './AgendaFreela'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [freela, setFreela] = useState(null)
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(null) // id chamada carregando
  const [notificacao, setNotificacao] = useState(null) // mensagem simples de notificação

  const audioRef = useRef(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      if (!user) {
        navigate('/login')
        return
      }
      setUsuario(user)
      // Busca dados freela
      try {
        const docRef = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists() && snap.data().tipo === 'freela') {
          setFreela({ uid: user.uid, ...snap.data() })
        } else {
          alert('Acesso negado: não é freelancer.')
          signOut(auth)
          navigate('/login')
        }
      } catch (err) {
        console.error('Erro ao buscar dados do freela:', err)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribeAuth()
  }, [navigate])

  // Escuta chamadas em tempo real
  useEffect(() => {
    if (!freela) return

    const chamadasRef = collection(db, 'chamadas')
    const q = query(chamadasRef, where('freelaUid', '==', freela.uid))

    const unsubscribeChamadas = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      setChamadas(lista)

      // Tocar som se houver nova chamada pendente
      const temNovaPendentes = lista.some(
        c => c.status === 'PENDENTE' && !chamadas.some(old => old.id === c.id)
      )
      if (temNovaPendentes && audioRef.current) {
        audioRef.current.play()
        setNotificacao('Nova chamada recebida!')
        setTimeout(() => setNotificacao(null), 5000)
      }
    })

    return () => unsubscribeChamadas()
  }, [freela, chamadas])

  const atualizarStatus = async (id, novoStatus) => {
    if (!window.confirm(`Confirmar ${novoStatus.toLowerCase()} da chamada?`)) return
    try {
      setLoadingStatus(id)
      await updateDoc(doc(db, 'chamadas', id), { status: novoStatus })
      setLoadingStatus(null)
      setNotificacao(`Chamada ${novoStatus.toLowerCase()} com sucesso!`)
      setTimeout(() => setNotificacao(null), 5000)
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      alert('Erro ao atualizar status da chamada.')
      setLoadingStatus(null)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (err) {
      alert('Erro ao sair.')
      console.error(err)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">Carregando painel...</p>
      </div>
    )
  }

  if (!freela) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Acesso não autorizado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      {notificacao && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50 animate-fadeInOut">
          {notificacao}
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-700">👨‍🍳 Painel do Freelancer</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/editarperfilfreela')}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              ✏️ Editar Perfil
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              🔒 Logout
            </button>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">📇 Meus Dados</h2>
          <div className="flex items-center gap-4">
            {freela.foto ? (
              <img
                src={freela.foto}
                alt="Foto do freela"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-200 flex items-center justify-center text-3xl font-bold text-orange-700">
                {freela.nome?.[0] || 'F'}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold">{freela.nome}</p>
              <p className="text-gray-600">{freela.funcao}</p>
              <p className="text-gray-700 mt-2">{freela.biografia || 'Sem biografia'}</p>
            </div>
          </div>
        </section>

        <AgendaFreela freela={freela} />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">📞 Chamadas</h2>
          {chamadas.length === 0 ? (
            <p className="text-gray-600">Nenhuma chamada no momento.</p>
          ) : (
            chamadas.map(c => (
              <div
                key={c.id}
                className="border border-gray-300 rounded-xl p-4 mb-4 bg-white shadow-sm flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Vaga:</strong> {c.vagaTitulo || 'Vaga não informada'}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={`px-2 py-0.5 rounded ${
                        c.status === 'APROVADO'
                          ? 'bg-green-100 text-green-700'
                          : c.status === 'REJEITADO'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  {c.status === 'PENDENTE' && (
                    <>
                      <button
                        disabled={loadingStatus === c.id}
                        onClick={() => atualizarStatus(c.id, 'APROVADO')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {loadingStatus === c.id ? 'Carregando...' : '✅ Aceitar'}
                      </button>
                      <button
                        disabled={loadingStatus === c.id}
                        onClick={() => atualizarStatus(c.id, 'REJEITADO')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {loadingStatus === c.id ? 'Carregando...' : '❌ Recusar'}
                      </button>
                    </>
                  )}
                  {c.status === 'APROVADO' && (
                    <button
                      onClick={() => alert('Função de check-in/check-out a implementar')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Check-in / Check-out
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <button
          onClick={() => navigate('/vagasdisponiveis')}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          🔍 Ver Vagas Disponíveis
        </button>
      </div>
    </div>
  )
}
