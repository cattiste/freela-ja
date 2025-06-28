import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '@/firebase'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [vagas, setVagas] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [datasOcupadas, setDatasOcupadas] = useState([])
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

  const carregarAgenda = useCallback((uid) => {
    const ref = collection(db, 'usuarios', uid, 'agenda')
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const datas = snapshot.docs.map(doc => doc.id)
      setDatasOcupadas(datas)
    })
    return unsubscribe
  }, [])

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

      const unsubscribeChamadas = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
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

      const unsubscribeAgenda = carregarAgenda(usuario.uid)

      return () => {
        unsubscribeChamadas()
        unsubscribeAgenda()
      }
    } catch (err) {
      console.error('Erro ao carregar freela:', err)
      navigate('/login')
    }
  }, [navigate, tocarSomChamada, carregarAgenda])

  useEffect(() => {
    let unsubscribeVagas = () => {}

    const iniciar = async () => {
      const unsub = await carregarFreela()

      const vagasRef = collection(db, 'vagas')
      const q = query(vagasRef, where('status', '==', 'ativo'))

      unsubscribeVagas = onSnapshot(q, (snapshot) => {
        const vagasLista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(vagasLista)
      })

      return () => {
        unsub?.()
        unsubscribeVagas()
      }
    }

    iniciar()
    return () => {
      unsubscribeVagas()
    }
  }, [carregarFreela])

  const formatTimestamp = (timestamp) => {
    try {
      return timestamp?.toDate?.().toLocaleString() || '—'
    } catch {
      return '—'
    }
  }

  const fazerCheckin = async () => {
    const chamada = chamadas.find(c => !c.checkInFreela && c.status === 'aceita')
    if (!freela || !chamada) {
      alert('Nenhuma chamada disponível para check-in.')
      return
    }

    setLoadingCheckin(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkInFreela: true,
        checkInHora: serverTimestamp()
      })

      const dataHoje = new Date().toISOString().split('T')[0]
      await setDoc(doc(db, 'usuarios', freela.uid, 'agenda', dataHoje), { ocupado: true })

      alert('✅ Check-in realizado e data marcada na agenda.')
    } catch (err) {
      alert('Erro ao fazer check-in.')
      console.error(err)
    }
    setLoadingCheckin(false)
  }

  const fazerCheckout = async () => {
    const chamada = chamadas.find(c => c.checkInFreela && !c.checkOutFreela && c.status === 'aceita')
    if (!freela || !chamada) {
      alert('Nenhuma chamada disponível para check-out.')
      return
    }

    setLoadingCheckout(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkOutFreela: true,
        checkOutHora: serverTimestamp()
      })
      alert('✅ Check-out registrado com sucesso.')
    } catch (err) {
      alert('Erro ao fazer check-out.')
      console.error(err)
    }
    setLoadingCheckout(false)
  }

  const marcarData = async (date) => {
    const dia = date.toISOString().split('T')[0]
    if (datasOcupadas.includes(dia)) {
      if (window.confirm('Deseja liberar esta data da agenda?')) {
        await deleteDoc(doc(db, 'usuarios', freela.uid, 'agenda', dia))
      }
    } else {
      await setDoc(doc(db, 'usuarios', freela.uid, 'agenda', dia), { ocupado: true })
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  if (!freela) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">🎯 Painel do Freelancer</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            🔒 Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-6">
              <img
                src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                className="w-24 h-24 rounded-full object-cover border shadow"
              />
              <div>
                <h2 className="text-2xl font-semibold">{freela.nome}</h2>
                <p>{freela.funcao}</p>
                <p>{freela.email}</p>
                <p>📱 {freela.celular}</p>
                <p>📍 {freela.endereco}</p>
                <p className="text-green-700 mt-1 font-semibold">💰 R$ {freela.valorDiaria || '—'}</p>
                <div className="mt-4 flex gap-4">
                  <button onClick={fazerCheckin} disabled={loadingCheckin} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                    {loadingCheckin ? 'Check-in...' : 'Fazer Check-in'}
                  </button>
                  <button onClick={fazerCheckout} disabled={loadingCheckout} className="bg-yellow-600 text-white px-4 py-2 rounded-lg">
                    {loadingCheckout ? 'Check-out...' : 'Fazer Check-out'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chamadas */}
          <div className="bg-white rounded-2xl shadow p-6 max-h-[500px] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Chamadas Ativas</h2>
            {chamadas.length === 0 ? <p>Nenhuma chamada.</p> : chamadas.map((ch) => (
              <div key={ch.id} className="border p-3 rounded mb-2">
                <p><strong>Estabelecimento:</strong> {ch.estabelecimentoNome}</p>
                <p><strong>Status:</strong> {ch.status}</p>
                <p><strong>Check-in:</strong> {ch.checkInFreela ? '✅' : '—'}</p>
                <p><strong>Check-out:</strong> {ch.checkOutFreela ? '✅' : '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vagas */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">📌 Vagas Disponíveis</h2>
          {vagas.length === 0 ? (
            <p className="text-gray-600">Nenhuma vaga disponível.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vagas.map((vaga) => (
                <div
                  key={vaga.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/vaga/${vaga.id}`)}
                >
                  <h3 className="text-lg font-bold">{vaga.titulo}</h3>
                  <p><strong>🏢</strong> {vaga.empresa || '—'}</p>
                  <p><strong>📍</strong> {vaga.cidade || '—'}</p>
                  <p><strong>💰</strong> {vaga.valorDiaria ? `R$ ${vaga.valorDiaria.toFixed(2)}` : vaga.salario || '—'}</p>
                  <p className="text-sm mt-1">{vaga.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agenda */}
        <div className="mt-12 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📅 Minha Agenda</h2>
          <Calendar
            onClickDay={marcarData}
            tileDisabled={({ date }) =>
              datasOcupadas.includes(date.toISOString().split('T')[0])
            }
          />
          <p className="text-sm text-gray-500 mt-2">
            Clique em uma data para marcar como ocupada. Clique novamente para liberar.
          </p>
        </div>
      </div>
    </div>
  )
}
