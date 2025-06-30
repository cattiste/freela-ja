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
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { signOut } from 'firebase/auth'

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

  const formatTimestamp = t => {
    try {
      if (!t) return '—'
      if (typeof t.toDate === 'function') return t.toDate().toLocaleString()
      if (t instanceof Date) return t.toLocaleString()
      return '—'
    } catch {
      return '—'
    }
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
              onClick={() => navigate('/editar-perfil-freela')}
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
          </div>

          <div className="bg-white rounded-2xl shadow p-6 max-h-[500px] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Chamadas Ativas</h2>
            {chamadas.length === 0 && <p>Nenhuma chamada ativa.</p>}
            {chamadas.map(chamada => (
              <div key={chamada.id} className="border rounded p-3 mb-4">
                <p>
                  <strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}
                </p>
                <p>
                  <strong>Status:</strong> {chamada.status}
                </p>
                <p>
                  <strong>Check-in feito:</strong> {chamada.checkInFreela ? 'Sim' : 'Não'}
                </p>
                <p>
                  <strong>Check-out feito:</strong> {chamada.checkOutFreela ? 'Sim' : 'Não'}
                </p>
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
