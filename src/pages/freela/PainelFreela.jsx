// src/pages/freela/PainelFreela.jsx
import React, { useEffect, useState, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, onSnapshot, query, where, doc as docRef, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { toast, Toaster } from 'react-hot-toast'

import VagasDisponiveis from './VagasDisponiveis';
import MinhasAgendasFreela from '@/components/MinhasAgendasFreela'
import HistoricoChamadasFreela from '@/components/HistoricoChamadasFreela'
import ChamadaInline from '@/components/ChamadaInline'

export default function PainelFreela() {
  const [freela, setFreela] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState('vagas')
  const audioRef = useRef(null)
  const [chamadaAtiva, setChamadaAtiva] = useState(null)

  const { online } = useOnlineStatus(freela?.uid)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFreela(null)
        setCarregando(false)
        return
      }
      try {
        const ref = docRef(db, 'usuarios', user.uid)
        const snap = await ref.get()
        if (snap.exists && snap.data().tipo === 'freela') {
          const data = snap.data()
          setFreela({ uid: user.uid, ...data })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        } else {
          setFreela(null)
        }
      } catch (err) {
        console.error('Erro ao buscar dados do freela:', err)
        setFreela(null)
      } finally {
        setCarregando(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Atualiza última atividade a cada 30s
  useEffect(() => {
    if (!freela?.uid) return
    const iv = setInterval(() => {
      updateDoc(docRef(db, 'usuarios', freela.uid), {
        ultimaAtividade: serverTimestamp()
      }).catch(console.error)
    }, 30000)
    return () => clearInterval(iv)
  }, [freela])

  // Detecta chamadas em tempo real
  useEffect(() => {
    if (!freela?.uid) return

    const unsub = onSnapshot(
      query(
        collection(db, 'chamadas'),
        where('freelaUid', '==', freela.uid),
        where('status', '==', 'pendente')
      ),
      (snap) => {
        if (!snap.empty) {
          const chamada = snap.docs[0].data()
          setChamadaAtiva({ ...chamada, id: snap.docs[0].id })
          if (audioRef.current) {
            audioRef.current.play().catch(() => {})
          }
          toast.success('Você recebeu uma nova chamada!')
        }
      }
    )
    return () => unsub()
  }, [freela])

  const handleLogout = async () => {
    if (freela?.uid) {
      await updateDoc(docRef(db, 'usuarios', freela.uid), {
        ultimaAtividade: serverTimestamp()
      })
    }
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    window.location.href = '/login'
  }

  const renderConteudo = () => {
    switch (aba) {
      case 'vagas':
        return <VagasDisponiveis freela={freela} />
      case 'agendas':
        return <MinhasAgendasFreela freela={freela} />
      case 'historico':
        return <HistoricoChamadasFreela freela={freela} />
      default:
        return null
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg font-semibold">Carregando painel...</p>
      </div>
    )
  }
  if (!freela) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg font-semibold">Acesso não autorizado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-orange-700 flex items-center gap-3">
            👤 Painel do Freela
            <span className={`text-sm font-semibold ${online ? 'text-green-600' : 'text-gray-400'}`}>
              ● {online ? 'Online' : 'Offline'}
            </span>
          </h1>
          <nav className="border-b border-orange-300 mb-6 overflow-x-auto">
            <ul className="flex space-x-2 whitespace-nowrap">
              {[ ['vagas', '💼 Vagas'], ['agendas', '📅 Agendas'], ['historico', '📜 Histórico'] ].map(([key, label]) => (
                <li key={key}>
                  <button
                    onClick={() => setAba(key)}
                    className={`px-4 py-2 border-b-2 font-semibold transition ${aba === key ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-orange-600 hover:border-orange-400'}`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <section>{renderConteudo()}</section>

        {chamadaAtiva && (
          <div className="fixed bottom-5 right-5 z-50 animate-bounce">
            <button
              onClick={() => setAba('agendas')}
              className="bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-700"
            >
              🚨 Nova Chamada!
            </button>
          </div>
        )}
      </div>
      <Toaster position="top-center" reverseOrder={false} />
      <audio ref={audioRef} src="/sons/chamada.mp3" preload="auto" />
      <ChamadaInline usuario={freela} tipo="freela" />
    </div>
  )
}
