// src/pages/freela/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

import HistoricoChamadasFreela from '@/pages/freela/HistoricoChamadasFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import RecebimentosFreela from '@/pages/freela/RecebimentosFreela'
import Chat from '@/pages/Chat'
import AgendaCompleta from '@/pages/freela/AgendaCompleta'
import VagasDisponiveis from '@/pages/freela/VagasDisponiveis'
import EventosDisponiveis from '@/pages/freela/EventosDisponiveis'

export default function PainelFreela() {
  const navigate = useNavigate()
  const { rota } = useParams()
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [chamadas, setChamadas] = useState([])
  const [agendaAba, setAgendaAba] = useState('agenda')

  useEffect(() => {
    let unsubChamadas = null
    const unsubAuth = onAuthStateChanged(auth, async user => {
      if (!user) return navigate('/login')
      const ref = doc(db, 'usuarios', user.uid)
      const snap = await getDoc(ref)
      if (!snap.exists() || snap.data().tipo !== 'freela') return navigate('/login')
      const data = { uid: user.uid, ...snap.data() }
      setUsuario(data)
      unsubChamadas = onSnapshot(
        query(collection(db, 'chamadas'), where('freelaUid', '==', user.uid)),
        snap => setChamadas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      )
      await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
      setCarregando(false)
    })
    return () => {
      unsubAuth()
      if (unsubChamadas) unsubChamadas()
    }
  }, [navigate])

  useEffect(() => {
    if (!usuario?.uid) return
    const interval = setInterval(() => {
      updateDoc(doc(db, 'usuarios', usuario.uid), { ultimaAtividade: serverTimestamp() }).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [usuario])

  const handleLogout = async () => {
    if (usuario?.uid) await updateDoc(doc(db, 'usuarios', usuario.uid), { ultimaAtividade: serverTimestamp() })
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const renderConteudo = () => {
    const rotaFinal = rota || 'perfil'
    switch (rotaFinal) {
      case 'perfil':
        return <PerfilFreela freelaUidProp={usuario.uid} mostrarBotaoVoltar={false} />

      case 'agendas':
        return (
          <>
            <nav className="border-b border-orange-300 mt-4 mb-6 overflow-x-auto">
              <ul className="flex space-x-2 whitespace-nowrap">
                {[
                  ['agenda', '📅 Agenda'],
                  ['vagas', '📋 Vagas Disponíveis'],
                  ['eventos', '🎉 Eventos Disponíveis']
                ].map(([key, label]) => (
                  <li key={key}>
                    <button
                      onClick={() => setAgendaAba(key)}
                      className={`px-4 py-2 border-b-2 font-semibold transition ${
                        agendaAba === key
                          ? 'border-orange-600 text-orange-600'
                          : 'border-transparent text-gray-400 hover:text-orange-600 hover:border-orange-400'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            {agendaAba === 'agenda' && <AgendaCompleta freela={usuario} />}
            {agendaAba === 'vagas' && <VagasDisponiveis freela={usuario} />}
            {agendaAba === 'eventos' && <EventosDisponiveis freela={usuario} />}
          </>
        )

      case 'historico':
        return <HistoricoChamadasFreela freelaUid={usuario.uid} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
      case 'recebimentos':
        return <RecebimentosFreela freela={usuario} />
      case 'chat': {
        const ativa = chamadas.find(c => c.status === 'aceita')
        return ativa ? <Chat chamadaId={ativa.id} /> : <p className="text-center text-gray-500 mt-4">Nenhuma chamada ativa.</p>
      }
      case 'configuracoes':
        return <ConfiguracoesFreela freela={usuario} />
      case 'avaliar-estabelecimento': {
        const pend = chamadas.find(c => c.checkOutFreela && !c.avaliacaoFreelaFeita)
        if (!pend) return <p className="text-center text-gray-600 mt-4">Nenhuma avaliação pendente.</p>
        return (
          <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">📝 Avalie o estabelecimento</h3>
            {/* formulário de avaliação */}
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
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
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
              ['agendas', '📂 Agendas'],
              ['historico', '📜 Histórico'],
              ['avaliacoes', '⭐ Avaliações'],
              ['recebimentos', '💰 Recebimentos'],
              ['chat', '💬 Chat'],
              ['configuracoes', '⚙️ Configurações'],
              ['avaliar-estabelecimento', '📝 Avaliar Estabelecimento']
            ].map(([key, label]) => (
              <li key={key}>
                <button onClick={() => navigate(`/painelfreela/${key}`)} className={`px-4 py-2 border-b-2 font-semibold transition ${ (rota || 'perfil') === key ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-orange-600 hover:border-orange-400'}`}>
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
