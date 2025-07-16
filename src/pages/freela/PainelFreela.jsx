// src/pages/freela/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  addDoc
} from 'firebase/firestore'
import { toast } from 'react-hot-toast'

import HistoricoChamadasFreela from '@/pages/freela/HistoricoChamadasFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import RecebimentosFreela from '@/pages/freela/RecebimentosFreela'
import AgendaCompleta from '@/pages/freela/AgendaCompleta'
import Chat from '@/pages/Chat'

// Novos imports para Vagas e Eventos
import VagasDisponiveis from '@/pages/freela/VagasDisponiveis'
import EventosDisponiveis from '@/pages/freela/EventosDisponiveis'

export default function PainelFreela() {
  const navigate = useNavigate()
  const { rota } = useParams()
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    let unsubscribeChamadas = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        try {
          const snap = await getDoc(docRef)
          if (snap.exists() && snap.data().tipo === 'freela') {
            const usuarioData = { uid: user.uid, ...snap.data() }
            setUsuario(usuarioData)

            unsubscribeChamadas = onSnapshot(
              query(collection(db, 'chamadas'), where('freelaUid', '==', user.uid)),
              (snapshot) => {
                setChamadas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
              }
            )

            await updateDoc(docRef, { ultimaAtividade: serverTimestamp() })
            setCarregando(false)
          } else {
            navigate('/login')
          }
        } catch {
          navigate('/login')
        }
      } else {
        navigate('/login')
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeChamadas) unsubscribeChamadas()
    }
  }, [navigate])

  // update presença
  useEffect(() => {
    if (!usuario?.uid) return
    const interval = setInterval(() => {
      updateDoc(doc(db, 'usuarios', usuario.uid), { ultimaAtividade: serverTimestamp() }).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [usuario])

  const handleLogout = async () => {
    if (usuario?.uid) {
      await updateDoc(doc(db, 'usuarios', usuario.uid), { ultimaAtividade: serverTimestamp() })
    }
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const renderConteudo = () => {
    const rotaFinal = rota || 'perfil'
    switch (rotaFinal) {
      case 'perfil':
        return <PerfilFreela freelaUidProp={usuario.uid} mostrarBotaoVoltar={false} />
      case 'vagas':
        return <VagasDisponiveis freela={usuario} />
      case 'eventos':
        return <EventosDisponiveis freela={usuario} />
      case 'agenda':
        return <AgendaCompleta freela={usuario} />
      case 'historico':
        return <HistoricoChamadasFreela freelaUid={usuario.uid} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
      case 'recebimentos':
        return <RecebimentosFreela freela={usuario} />
      case 'chat': {
        const chamadaAtiva = chamadas.find(c => c.status === 'aceita')
        return chamadaAtiva ? <Chat chamadaId={chamadaAtiva.id} /> : <p className="text-center text-gray-500 mt-4">Nenhuma chamada ativa.</p>
      }
      case 'configuracoes':
        return <ConfiguracoesFreela freela={usuario} />
      case 'avaliar-estabelecimento': {
        const call = chamadas.find(c => c.checkOutFreela && !c.avaliacaoFreelaFeita)
        if (!call) return <p className="text-center text-gray-600 mt-4">Nenhuma avaliação pendente.</p>
        return (
          <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">📝 Avalie o estabelecimento</h3>
            <form onSubmit={async e => { /* ... */ }} className="flex flex-col gap-2">{/* ... */}</form>
          </div>
        )
      }
      default:
        return <PerfilFreela freelaUidProp={usuario.uid} mostrarBotaoVoltar={false} />
    }
  }

  if (carregando || !usuario) {
    return <div className="min-h-screen flex items-center justify-center text-orange-600 text-lg">Carregando painel...</div>
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-700">🧑‍🍳 Painel do Freelancer</h1>
            <p className="text-gray-600 mt-1">{usuario.nome} — {usuario.funcao}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(`/editarfreela/${usuario.uid}`)} className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition">✏️ Editar Perfil</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">🔒 Logout</button>
          </div>
        </div>

        <nav className="border-b border-orange-300 mb-6 overflow-x-auto">
          <ul className="flex space-x-2 whitespace-nowrap">
            {[
              ['perfil', '👤 Perfil'],
              ['vagas', '📋 Vagas CLT'],
              ['eventos', '🎉 Eventos Freela'],
              ['agenda', '📅 Agenda'],
              ['historico', '📜 Histórico'],
              ['avaliacoes', '⭐ Avaliações'],
              ['recebimentos', '💰 Recebimentos'],
              ['chat', '💬 Chat'],
              ['configuracoes', '⚙️ Configurações'],
              ['avaliar-estabelecimento', '📝 Avaliar Estabelecimento']
            ].map(([key, label]) => (
              <li key={key}>
                <button onClick={() => navigate(`/painelfreela/${key}`)} className={`px-4 py-2 border-b-2 font-semibold transition ${(rota || 'perfil') === key ? 'border-orange-600 text-orange-600' : 'border-transparent text-orange-400 hover:text-orange-600 hover:border-orange-400'}`}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section>{renderConteudo()}</section>
      </div>
    </div>
  )
}
