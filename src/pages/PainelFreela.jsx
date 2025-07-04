import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getDatabase, ref, onDisconnect, set } from 'firebase/database'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  orderBy
} from 'firebase/firestore'

import HistoricoTrabalhosFreela from './freelas/HistoricoTrabalhosFreela'
import AvaliacoesRecebidasFreela from './freelas/AvaliacoesRecebidasFreela'
import ConfiguracoesFreela from './freelas/ConfiguracoesFreela'
import PerfilFreela from './PerfilFreela'
import RecebimentosFreela from './freelas/RecebimentosFreela'
import AgendaCompleta from './freelas/AgendaCompleta'
import HistoricoChamadasFreela from './freelas/HistoricoChamadasFreela'

  const dbRT = getDatabase()
  const statusRef = ref(dbRT, `/status/${usuario.uid}`)
   set(statusRef, { online: true })
   onDisconnect(statusRef).set({ online: false })

function Chat({ chamadaId }) {
  const [usuario, setUsuario] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [mensagens, setMensagens] = useState([])
  const divFimRef = useRef(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUsuario(user)
      else setUsuario(null)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!chamadaId) return
    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    const q = query(mensagensRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMensagens(msgs)
      setTimeout(() => {
        if (divFimRef.current) divFimRef.current.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    return () => unsubscribe()
  }, [chamadaId])

  const enviarMensagem = async (e) => {
    e.preventDefault()
    if (!mensagem.trim()) return
    if (!usuario) return alert('Usuário não autenticado')

    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    try {
      await addDoc(mensagensRef, {
        texto: mensagem.trim(),
        remetenteUid: usuario.uid,
        remetenteNome: usuario.displayName || usuario.email || 'Usuário',
        createdAt: serverTimestamp()
      })
      setMensagem('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    }
  }

  return (
    <div className="flex flex-col h-[500px] max-w-2xl mx-auto border rounded shadow p-4 bg-white">
      <div className="flex-grow overflow-auto mb-4 space-y-2">
        {mensagens.length === 0 && (
          <p className="text-gray-500 text-center mt-10">Nenhuma mensagem ainda.</p>
        )}
        {mensagens.map((msg) => {
          const isRemetente = msg.remetenteUid === usuario?.uid
          return (
            <div key={msg.id} className={`flex ${isRemetente ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-lg ${
                isRemetente ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                <p className="text-xs font-semibold">{msg.remetenteNome}</p>
                <p>{msg.texto}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Enviando...'}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={divFimRef} />
      </div>
      <form onSubmit={enviarMensagem} className="flex gap-2">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-grow border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
          disabled={!mensagem.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

export default function PainelFreela() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [aba, setAba] = useState('perfil')
  const [carregando, setCarregando] = useState(true)
  const [chamadas, setChamadas] = useState([])
  const [loadingCheckin, setLoadingCheckin] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  useEffect(() => {
    let unsubscribeChamadas = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        try {
          const snap = await getDoc(docRef)
          if (snap.exists() && snap.data().tipo === 'freela') {
            const userData = { uid: user.uid, ...snap.data() }
            setUsuario(userData)

            await updateDoc(docRef, { online: true }) // online TRUE

            const chamadasRef = collection(db, 'chamadas')
            const q = query(chamadasRef, where('freelaUid', '==', user.uid))
            unsubscribeChamadas = onSnapshot(q, (snapshot) => {
              setChamadas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
            })

            setCarregando(false)
          } else {
            setUsuario(null)
            setCarregando(false)
          }
        } catch (error) {
          console.error('Erro ao buscar usuário:', error)
          setUsuario(null)
          setCarregando(false)
        }
      } else {
        setUsuario(null)
        setCarregando(false)
      }
    })

    const handleUnload = async () => {
      if (usuario?.uid) {
        await updateDoc(doc(db, 'usuarios', usuario.uid), { online: false }) // online FALSE
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      unsubscribeAuth()
      if (unsubscribeChamadas) unsubscribeChamadas()
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [usuario])

  useEffect(() => {
    if (!usuario?.uid) return

    const chamadasRef = collection(db, 'chamadas')
    const q = query(chamadasRef, where('freelaUid', '==', usuario.uid), where('status', '==', 'pendente'))

    let primeiraCarga = true
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chamadasPendentes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      if (!primeiraCarga && chamadasPendentes.length > 0) {
        const audio = new Audio('/sons/chamada.mp3')
        audio.play().catch(() => {})
      }
      primeiraCarga = false
    })

    return () => unsubscribe()
  }, [usuario])

  const fazerCheckin = async () => {
    const chamada = chamadas.find((c) => !c.checkInFreela && c.status === 'aceita')
    if (!chamada) return alert('Nenhuma chamada pendente para check-in.')
    setLoadingCheckin(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkInFreela: true,
        checkInHora: serverTimestamp()
      })
      alert('Check-in realizado!')
    } catch (error) {
      console.error('Erro ao fazer check-in:', error)
      alert('Erro ao fazer check-in.')
    }
    setLoadingCheckin(false)
  }

  const fazerCheckout = async () => {
    const chamada = chamadas.find((c) => c.checkInFreela && !c.checkOutFreela && c.status === 'aceita')
    if (!chamada) return alert('Nenhuma chamada pendente para check-out.')
    setLoadingCheckout(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkOutFreela: true,
        checkOutHora: serverTimestamp(),
        status: 'checkout'
      })
      alert('Check-out realizado!')
    } catch (error) {
      console.error('Erro ao fazer check-out:', error)
      alert('Erro ao fazer check-out.')
    }
    setLoadingCheckout(false)
  }

  const handleLogout = async () => {
    if (usuario?.uid) {
      await updateDoc(doc(db, 'usuarios', usuario.uid), { online: false })
    }
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const renderConteudo = () => {
    switch (aba) {
      case 'perfil':
        return <PerfilFreela freelaUidProp={usuario.uid} mostrarBotaoVoltar={false} />
      case 'agenda':
        return <AgendaCompleta freela={usuario} />
      case 'historico':
        return <HistoricoChamadasFreela freelaUid={usuario.uid} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
      case 'recebimentos':
        return <RecebimentosFreela />
      case 'chat':
        const chamadaAtiva = chamadas.find(c => c.status === 'aceita')
        return chamadaAtiva ? (
          <Chat chamadaId={chamadaAtiva.id} />
        ) : (
          <div className="text-center text-gray-500 mt-4">Nenhuma chamada ativa para chat.</div>
        )
      case 'chamadas':
        return (
          <div className="text-center text-orange-600 mt-4">
            Acesse a aba Chat ou aguarde uma nova chamada.
          </div>
        )
      case 'configuracoes':
        return <ConfiguracoesFreela />
      default:
        return <PerfilFreela freelaUidProp={usuario.uid} mostrarBotaoVoltar={false} />
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600 text-lg">
        Carregando painel...
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        Acesso não autorizado.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-700">🧑‍🍳 Painel do Freelancer</h1>
            <p className="text-gray-600 mt-1">
              {usuario.nome} — {usuario.funcao}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/editarfreela/${usuario.uid}`)}
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
        </div>

        <nav className="border-b border-orange-300 mb-6">
          <ul className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'perfil', label: '🧑 Perfil' },
              { key: 'chamadas', label: '📞 Chamadas' },
              { key: 'agenda', label: '📆 Minha Agenda' },
              { key: 'chat', label: '💬 Chat' },
              { key: 'avaliacoes', label: '⭐ Avaliações' },
              { key: 'historico', label: '📜 Histórico' },
              { key: 'configuracoes', label: '⚙️ Configurações' },
              { key: 'recebimentos', label: '💵 Recebimentos' }
            ].map(({ key, label }) => (
              <li key={key} className="list-none">
                <button
                  onClick={() => setAba(key)}
                  className={`px-4 py-2 -mb-px border-b-2 font-semibold transition whitespace-nowrap ${
                    aba === key
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-orange-400 hover:text-orange-600 hover:border-orange-400'
                  }`}
                >
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