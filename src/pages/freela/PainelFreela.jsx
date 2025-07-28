// src/pages/freela/PainelFreela.jsx

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

// Componentes
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AgendaCompleta from '@/pages/freela/AgendaCompleta'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [vagas, setVagas] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [loadingCheckin, setLoadingCheckin] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [abaSelecionada, setAbaSelecionada] = useState('painel')

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

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'agendaCompleta':
        return (
          <div className="max-w-7xl mx-auto p-4">
            <AgendaCompleta freela={freela} />
          </div>
        )

      case 'agenda':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <AgendaFreela freela={freela} />
          </div>
        )

      case 'painel':
      default:
        return (
          <>
            {/* conteúdo original do painel que você já tinha */}
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
