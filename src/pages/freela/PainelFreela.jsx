// src/pages/freela/PainelFreela.jsx
import React, { useEffect, useState, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, onSnapshot, query, where, doc as docRef, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { toast, Toaster } from 'react-hot-toast'

// Importando os componentes das sub-abas
import ChamadasFreela from './ChamadasFreela'
import AgendaFreela from './AgendaFreela'
import EventosDisponiveis from './EventosDisponiveis'
import PainelFreelaVagas from './PainelFreelaVagas'
import HistoricoTrabalhosFreela from './HistoricoTrabalhosFreela'
import EditarFreela from './EditarFreela'
import CadastroFreela from './CadastroFreela'
import ConfiguracoesFreela from './ConfiguracoesFreela'
import RecebimentosFreela from './RecebimentosFreela'
import ChamadaInline from '@/components/ChamadaInline'

export default function PainelFreela() {
  const [freela, setFreela] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState('agenda')
  const [subAba, setSubAba] = useState('vagas')
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
        const snap = await getDoc(ref)
        if (snap.exists() && snap.data().tipo === 'freela') {
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

  useEffect(() => {
    if (!freela?.uid) return
    const iv = setInterval(() => {
      updateDoc(docRef(db, 'usuarios', freela.uid), {
        ultimaAtividade: serverTimestamp()
      }).catch(console.error)
    }, 30000)
    return () => clearInterval(iv)
  }, [freela])

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

  const renderSubAba = () => {
    switch (aba) {
      case 'agenda':
        switch (subAba) {
          case 'chamadas': return <ChamadasFreela freela={freela} />
          case 'agendas': return <AgendaFreela freela={freela} />
          case 'eventos': return <EventosDisponiveis freela={freela} />
          case 'vagas': return <PainelFreelaVagas freela={freela} />
          default: return null
        }
      case 'historico':
        return <HistoricoTrabalhosFreela freela={freela} />
      case 'configuracoes':
        switch (subAba) {
          case 'editar': return <EditarFreela freela={freela} />
          case 'cadastro': return <CadastroFreela freela={freela} />
          case 'ajustes': return <ConfiguracoesFreela freela={freela} />
          default: return null
        }
      case 'recebimentos':
        return <RecebimentosFreela freela={freela} />
      default:
        return null
    }
  }

  if (carregando) return <div className="min-h-screen flex items-center justify-center text-orange-600">Carregando...</div>
  if (!freela) return <div className="min-h-screen flex items-center justify-center text-red-600">Acesso negado.</div>

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-orange-700">👤 Painel do Freela <span className={`text-sm ml-3 font-semibold ${online ? 'text-green-600' : 'text-gray-400'}`}>● {online ? 'Online' : 'Offline'}</span></h1>
        </div>

        <nav className="mb-4 border-b">
          <ul className="flex flex-wrap gap-4">
            {[['agenda', '📅 Agenda'], ['historico', '📜 Histórico'], ['configuracoes', '⚙️ Configurações'], ['recebimentos', '💰 Recebimentos']].map(([key, label]) => (
              <li key={key}>
                <button onClick={() => setAba(key)} className={`px-4 py-2 font-semibold ${aba === key ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-orange-600'}`}>{label}</button>
              </li>
            ))}
          </ul>
        </nav>

        {['agenda', 'configuracoes'].includes(aba) && (
          <nav className="mb-4 border-b">
            <ul className="flex flex-wrap gap-2">
              {aba === 'agenda' && [
                ['chamadas', '🚨 Chamadas'],
                ['agendas', '📅 Agendas'],
                ['eventos', '🎉 Eventos'],
                ['vagas', '💼 Vagas']
              ].map(([key, label]) => (
                <li key={key}>
                  <button onClick={() => setSubAba(key)} className={`px-3 py-1 text-sm font-semibold ${subAba === key ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-orange-600'}`}>{label}</button>
                </li>
              ))}
              {aba === 'configuracoes' && [
                ['editar', '✏️ Editar Perfil'],
                ['cadastro', '📝 Cadastro'],
                ['ajustes', '⚙️ Ajustes Gerais']
              ].map(([key, label]) => (
                <li key={key}>
                  <button onClick={() => setSubAba(key)} className={`px-3 py-1 text-sm font-semibold ${subAba === key ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-orange-600'}`}>{label}</button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <section>{renderSubAba()}</section>

        {chamadaAtiva && (
          <div className="fixed bottom-5 right-5 z-50 animate-bounce">
            <button onClick={() => { setAba('agenda'); setSubAba('chamadas') }} className="bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-700">
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
