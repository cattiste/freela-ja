import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  getDoc
} from 'firebase/firestore'

async function salvarAvaliacao({ chamadaId, freelaUid, estabelecimentoUid, nota, comentario }) {
  try {
    // 1. Adiciona avaliação na coleção avaliacoesEstabelecimentos
    await addDoc(collection(db, "avaliacoesEstabelecimentos"), {
      chamadaId,
      freelaUid,
      estabelecimentoUid,
      nota,
      comentario,
      dataCriacao: serverTimestamp()
    })

    // 2. Atualiza a chamada para marcar que avaliação foi feita
    await updateDoc(doc(db, "chamadas", chamadaId), {
      avaliacaoFreelaFeita: true
    })

    alert("Avaliação enviada com sucesso!")
  } catch (err) {
    console.error("Erro ao salvar avaliação:", err)
    alert("Erro ao enviar avaliação. Tente novamente.")
  }
}

import HistoricoChamadasFreela from './freelas/HistoricoChamadasFreela'
import AvaliacoesRecebidasFreela from './freelas/AvaliacoesRecebidasFreela'
import ConfiguracoesFreela from './freelas/ConfiguracoesFreela'
import PerfilFreela from './PerfilFreela'
import RecebimentosFreela from './freelas/RecebimentosFreela'
import AgendaCompleta from './freelas/AgendaCompleta'
import Chat from './freelas/Chat'
import AvaliacaoEstabelecimento from '@/components/AvaliacaoEstabelecimento'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [aba, setAba] = useState('perfil')
  const [carregando, setCarregando] = useState(true)
  const [chamadas, setChamadas] = useState([])
  const [loadingCheckin, setLoadingCheckin] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  // Monitorar autenticação e carregar dados do usuário freela
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

            unsubscribeChamadas = onSnapshot(
              query(collection(db, 'chamadas'), where('freelaUid', '==', user.uid)),
              (snapshot) => {
                setChamadas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
              }
            )

            // Atualiza a última atividade na primeira carga
            await updateDoc(docRef, { ultimaAtividade: serverTimestamp() })

            setCarregando(false)
          } else {
            setUsuario(null)
            setCarregando(false)
          }
        } catch (err) {
          console.error('Erro ao buscar usuário:', err)
          setUsuario(null)
          setCarregando(false)
        }
      } else {
        setUsuario(null)
        setCarregando(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeChamadas) unsubscribeChamadas()
    }
  }, [])

  // Heartbeat: atualizar campo ultimaAtividade a cada 30 segundos
  useEffect(() => {
    if (!usuario?.uid) return

    const interval = setInterval(() => {
      updateDoc(doc(db, 'usuarios', usuario.uid), {
        ultimaAtividade: serverTimestamp()
      }).catch(err => console.error('Erro heartbeat:', err))
    }, 30000)

    return () => clearInterval(interval)
  }, [usuario])

  // Som ao receber chamada pendente (tocar só em novas chamadas, ignorar carga inicial)
  useEffect(() => {
    if (!usuario?.uid) return
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', '==', 'pendente')
    )

    let primeiraVez = true
    const unsub = onSnapshot(q, (snapshot) => {
      if (!primeiraVez && snapshot.size > 0) {
        const audio = new Audio('/sons/chamada.mp3')
        audio.play().catch(() => {
          console.log('Erro ao tentar tocar o som da chamada')
        })
      }
      primeiraVez = false
    })

    return () => unsub()
  }, [usuario])

  const fazerCheckin = async () => {
    const chamada = chamadas.find(c => c.status === 'aceita' && !c.checkInFreela)
    if (!chamada) return alert('Nada para check-in.')
    setLoadingCheckin(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkInFreela: true,
        checkInHora: serverTimestamp()
      })
    } catch (err) {
      console.error(err)
    }
    setLoadingCheckin(false)
  }

  const fazerCheckout = async () => {
    const chamada = chamadas.find(c => c.status === 'aceita' && c.checkInFreela && !c.checkOutFreela)
    if (!chamada) return alert('Nada para check-out.')
    setLoadingCheckout(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkOutFreela: true,
        checkOutHora: serverTimestamp()
      })
      alert('Check-out feito! Agora o estabelecimento precisa confirmar para finalizar o serviço.')
      setAba('historico') // mudar aba para histórico após o check-out
    } catch (err) {
      console.error(err)
    }
    setLoadingCheckout(false)
  }
    
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

  const renderConteudo = () => {
    switch (aba) {
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
      case 'chamadas':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">📞 Chamadas Ativas</h2>
            {chamadas
              .filter(c => c.status !== 'finalizado' && c.status !== 'recusada')
              .map((chamada) => (
                <div key={chamada.id} className="border rounded p-3 mb-4">
                  <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
                  <p><strong>Status:</strong> {chamada.status}</p>
                  <p><strong>Check-in feito:</strong> {chamada.checkInFreela ? 'Sim' : 'Não'}</p>
                  <p><strong>Check-out feito:</strong> {chamada.checkOutFreela ? 'Sim' : 'Não'}</p>
                  {chamada.status === 'pendente' && (
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={async () => {
                          await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'aceita' })
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        ✅ Aceitar
                      </button>
                      <button
                        onClick={async () => {
                          await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'recusada' })

                          // Remove do estado local para sumir da lista imediatamente
                          setChamadas((prev) => prev.filter(c => c.id !== chamada.id))

                          setAba('historico') // muda aba para histórico
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        ❌ Recusar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            <div className="mt-6 flex gap-4">
              <button
                onClick={fazerCheckin}
                disabled={loadingCheckin}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                {loadingCheckin ? 'Check-in...' : 'Fazer Check-in'}
              </button>
              <button
                onClick={fazerCheckout}
                disabled={loadingCheckout}
                className="bg-yellow-600 text-white px-6 py-2 rounded"
              >
                {loadingCheckout ? 'Check-out...' : 'Fazer Check-out'}
              </button>
            </div>
          </div>
        )
      case 'configuracoes':
        return <ConfiguracoesFreela />
      case 'avaliar-estabelecimento': {
        // Buscar chamada finalizada e ainda não avaliada
        const chamadaParaAvaliar = chamadas.find(
          c => c.status === 'finalizado' && !c.avaliacaoFreelaFeita
        )
        return chamadaParaAvaliar ? (
          <AvaliacaoEstabelecimento
            chamadaId={chamadaParaAvaliar.id}
            estabelecimentoUid={chamadaParaAvaliar.estabelecimentoUid}
            freelaUid={usuario.uid}
          />
        ) : (
          <p className="text-center text-gray-600 mt-4">Nenhuma avaliação pendente.</p>
        )
      }
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
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
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

        {/* Abas */}
        <nav className="border-b border-orange-300 mb-6">
          <ul className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
            {[
              { key: 'perfil', label: '👤 Perfil' },
              { key: 'chamadas', label: '📞 Chamadas' },
              { key: 'agenda', label: '📅 Agenda' },
              { key: 'historico', label: '📜 Histórico' },
              { key: 'avaliacoes', label: '⭐ Avaliações' },
              { key: 'recebimentos', label: '💰 Recebimentos' },
              { key: 'chat', label: '💬 Chat' },
              { key: 'configuracoes', label: '⚙️ Configurações' },
              { key: 'avaliar-estabelecimento', label: '📝 Avaliar Estabelecimento' }
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

        {/* Conteúdo */}
        <section>{renderConteudo()}</section>
      </div>
    </div>
  )
}
