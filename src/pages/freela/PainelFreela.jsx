import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

import HistoricoChamadasFreela from './HistoricoChamadasFreela'
import AvaliacoesRecebidasFreela from './AvaliacoesRecebidasFreela'
import ConfiguracoesFreela from './ConfiguracoesFreela'
import PerfilFreela from './freela/PerfilFreela'
import RecebimentosFreela from './RecebimentosFreela'
import AgendaCompleta from './AgendaCompleta'
import Chat from '../Chat'


export default function PainelFreela() {
  const navigate = useNavigate()
  const location = useLocation()
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [chamadas, setChamadas] = useState([])
  const [loadingCheckin, setLoadingCheckin] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  useEffect(() => {
    let unsubscribeChamadas = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        const docRef = doc(db, 'usuarios', usuario.uid)
        try {
          const snap = await getDoc(docRef)
          if (snap.exists() && snap.data().tipo === 'freela') {
            const usuarioData = { uid: usuario.uid, ...snap.data() }
            setUsuario(usuarioData)

            unsubscribeChamadas = onSnapshot(
              query(collection(db, 'chamadas'), where('freelaUid', '==', usuario.uid)),
              (snapshot) => {
                setChamadas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
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
  }, [])

  useEffect(() => {
    if (!usuario?.uid) return
    const interval = setInterval(() => {
      updateDoc(doc(db, 'usuarios', usuario.uid), {
        ultimaAtividade: serverTimestamp()
      }).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [usuario])

  const handleLogout = async () => {
    if (usuario?.uid) {
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        ultimaAtividade: serverTimestamp()
      })
    }
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const rota = location.pathname.split('/')[2] || 'perfil'

  const fazerCheckin = async () => {
    const chamada = chamadas.find(c => c.status === 'aceita' && !c.checkInFreela)
    if (!chamada) return toast.error('Nada para check-in.')
    setLoadingCheckin(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkInFreela: true,
        checkInHora: serverTimestamp()
      })
      toast.success('Check-in realizado!')
    } catch (err) {
      console.error(err)
      toast.error('Erro no check-in.')
    }
    setLoadingCheckin(false)
  }

  const fazerCheckout = async () => {
    const chamada = chamadas.find(c => c.status === 'aceita' && c.checkInFreela && !c.checkOutFreela)
    if (!chamada) return toast.error('Nada para check-out.')
    setLoadingCheckout(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkOutFreela: true,
        checkOutHora: serverTimestamp()
      })
      toast.success('Check-out realizado! Aguarde a avaliação.')
    } catch (err) {
      console.error(err)
      toast.error('Erro no check-out.')
    }
    setLoadingCheckout(false)
  }

  const renderConteudo = () => {
    switch (rota) {
      case 'perfil':
        return <PerfilFreela freelaUidProp={usuario.uid} mostrarBotaoVoltar={false} />
      case 'agenda':
        return <AgendaCompleta freela={usuario} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
      case 'historico':
        return <HistoricoChamadasFreela freelaUid={usuario.uid} />
      case 'recebimentos':
        return <RecebimentosFreela />
      case 'chat': {
        const chamadaAtiva = chamadas.find(c => c.status === 'aceita')
        return chamadaAtiva ? (
          <Chat chamadaId={chamadaAtiva.id} />
        ) : (
          <p className="text-center text-gray-500 mt-4">Nenhuma chamada ativa.</p>
        )
      }
      case 'configuracoes':
        return <ConfiguracoesFreela />
      case 'avaliar-estabelecimento': {
        const chamadaParaAvaliar = chamadas.find(
          c => c.checkOutFreela && !c.avaliacaoFreelaFeita
        )
        return chamadaParaAvaliar ? (
          <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">📝 Avalie o estabelecimento</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target
                const nota = parseInt(form.nota.value)
                const comentario = form.comentario.value
                try {
                  await addDoc(collection(db, 'avaliacoesEstabelecimentos'), {
                    chamadaId: chamadaParaAvaliar.id,
                    freelaUid: usuario.uid,
                    estabelecimentoUid: chamadaParaAvaliar.estabelecimentoUid,
                    nota,
                    comentario,
                    dataCriacao: serverTimestamp()
                  })
                  await updateDoc(doc(db, 'chamadas', chamadaParaAvaliar.id), {
                    avaliacaoFreelaFeita: true
                  })
                  toast.success('Avaliação enviada com sucesso!')
                } catch (err) {
                  toast.error('Erro ao enviar avaliação.')
                  console.error(err)
                }
              }}
              className="flex flex-col gap-2"
            >
              <label>
                Nota:
                <select name="nota" className="ml-2 border p-1 rounded" defaultValue="5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <textarea
                name="comentario"
                placeholder="Comentário"
                className="border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Enviar Avaliação
              </button>
            </form>
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-4">Nenhuma avaliação pendente.</p>
        )
      }
      default:
        return <PerfilFreela freelaUidProp={usuario.uid} mostrarBotaoVoltar={false} />
    }
  }

  if (carregando || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600 text-lg">
        Carregando painel...
      </div>
    )
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

        <nav className="border-b border-orange-300 mb-6 overflow-x-auto">
          <ul className="flex space-x-2 whitespace-nowrap">
            {[
              ['perfil', '👤 Perfil'],
              ['agenda', '📅 Agenda'],
              ['historico', '📜 Histórico'],
              ['avaliacoes', '⭐ Avaliações'],
              ['recebimentos', '💰 Recebimentos'],
              ['chat', '💬 Chat'],
              ['configuracoes', '⚙️ Configurações'],
              ['avaliar-estabelecimento', '📝 Avaliar Estabelecimento']
            ].map(([key, label]) => (
              <li key={key}>
                <button
                  onClick={() => navigate(`/painelfreela/${key}`)}
                  className={`px-4 py-2 border-b-2 font-semibold transition ${
                    rota === key
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
