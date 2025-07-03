import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { signOut } from 'firebase/auth'
import AgendaFreela from './AgendaFreela' // importe o componente agenda

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [vagas, setVagas] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [loadingCheckin, setLoadingCheckin] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const [audioChamada] = useState(() =>
    new Audio('https://res.cloudinary.com/dbemvuau3/video/upload/v1750961914/qhkd3ojkqhi2imr9lup8.mp3')
  )

  useEffect(() => {
    audioChamada.load()
  }, [audioChamada])

  const tocarSomChamada = useCallback(() => {
    audioChamada.play().catch(() => console.log('🔇 Áudio bloqueado'))
  }, [audioChamada])

  const carregarFreela = useCallback(async () => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    try {
      const ref = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        alert('Freelancer não encontrado.')
        navigate('/login')
        return
      }

      const dados = snap.data()
      setFreela({ uid: usuario.uid, ...dados })

      const chamadasRef = collection(db, 'chamadas')
      const q = query(chamadasRef, where('freelaUid', '==', usuario.uid))

      const unsubscribe = onSnapshot(q, snapshot => {
        snapshot.docChanges().forEach(change => {
          const chamada = { id: change.doc.id, ...change.doc.data() }
          if (change.type === 'added') {
            alert(`📩 Você foi chamado por ${chamada.estabelecimentoNome}!`)
            tocarSomChamada()
            setChamadas(prev => [chamada, ...prev])
          }
          if (change.type === 'modified') {
            setChamadas(prev =>
              prev.map(c => (c.id === chamada.id ? chamada : c))
            )
          }
          if (change.type === 'removed') {
            setChamadas(prev => prev.filter(c => c.id !== chamada.id))
          }
        })
      })

      return unsubscribe
    } catch (err) {
      console.error('Erro ao carregar freela:', err)
      navigate('/login')
    }
  }, [navigate, tocarSomChamada])

  useEffect(() => {
    let unsubscribeChamadas = () => {}
    let unsubscribeVagas = () => {}

    const iniciar = async () => {
      unsubscribeChamadas = await carregarFreela()
      const vagasRef = collection(db, 'vagas')
      const q = query(vagasRef, where('status', '==', 'ativo'))
      unsubscribeVagas = onSnapshot(q, snapshot => {
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      })
    }

    iniciar()

    return () => {
      unsubscribeChamadas()
      unsubscribeVagas()
    }
  }, [carregarFreela])

  const fazerCheckin = async () => {
    const chamada = chamadas.find(c => !c.checkInFreela && c.status === 'aceita')
    if (!chamada) return alert('Nenhuma chamada pendente para check-in.')
    setLoadingCheckin(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkInFreela: true,
        checkInHora: serverTimestamp()
      })
      alert('Check-in realizado!')
    } catch (err) {
      alert('Erro ao fazer check-in.')
    }
    setLoadingCheckin(false)
  }

  const fazerCheckout = async () => {
    const chamada = chamadas.find(c => c.checkInFreela && !c.checkOutFreela && c.status === 'aceita')
    if (!chamada) return alert('Nenhuma chamada pendente para check-out.')
    setLoadingCheckout(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkOutFreela: true,
        checkOutHora: serverTimestamp()
      })
      alert('Check-out realizado!')
    } catch (err) {
      alert('Erro ao fazer check-out.')
    }
    setLoadingCheckout(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  if (!freela) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-800">🎯 Painel do Freelancer</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/editarfreela/${freela.uid}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ✏️ Editar Perfil
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              🔒 Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-6">
              <img
                src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow"
                alt="Foto do freelancer"
              />
              <div>
                <h2 className="text-2xl font-semibold">{freela.nome}</h2>
                <p className="text-blue-600">{freela.funcao}</p>
                <p className="text-gray-600">{freela.email}</p>
                <p className="text-gray-600">📱 {freela.celular}</p>
                <p className="text-gray-600">📍 {freela.endereco}</p>
                <p className="text-green-700 font-semibold">💰 Diária: R$ {freela.valorDiaria || '—'}</p>
                <p className="text-sm text-gray-500 mt-1">📝 Tipo: {freela.tipoContrato || '—'}</p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={fazerCheckin}
                    disabled={loadingCheckin}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {loadingCheckin ? 'Registrando...' : 'Check-in'}
                  </button>
                  <button
                    onClick={fazerCheckout}
                    disabled={loadingCheckout}
                    className="bg-yellow-600 text-white px-4 py-2 rounded"
                  >
                    {loadingCheckout ? 'Registrando...' : 'Check-out'}
                  </button>
                </div>
              </div>
            </div>

            {/* Agenda do Freela */}
            <AgendaFreela freela={freela} />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 max-h-[500px] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Chamadas Ativas</h2>
            {chamadas.length === 0 && <p>Nenhuma chamada ativa.</p>}
            {chamadas.map(chamada => (
              <div key={chamada.id} className="border rounded p-3 mb-4">
                <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
                <p><strong>Status:</strong> {chamada.status}</p>
                <p><strong>Check-in feito:</strong> {chamada.checkInFreela ? 'Sim' : 'Não'}</p>
                <p><strong>Check-out feito:</strong> {chamada.checkOutFreela ? 'Sim' : 'Não'}</p>
                {chamada.status === 'pendente' && (
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={async () =>
                        await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'aceita' })
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      ✅ Aceitar
                    </button>
                    <button
                      onClick={async () =>
                        await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'recusada' })
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      ❌ Recusar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/vagasdisponiveis"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded px-6 py-3 transition"
          >
            🎯 Ver vagas disponíveis
          </Link>
        </div>
      </div>
    </div>
  )
}
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
