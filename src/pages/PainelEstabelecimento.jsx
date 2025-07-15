import { onSnapshot, query, collection, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

import { auth, db } from '@/firebase'

import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import PublicarVaga from '@/components/gerais/PublicarVaga'
import MinhasVagas from '@/components/MinhasVagas'
import CandidaturasEstabelecimento from '@/components/CandidaturasEstabelecimento'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

function estaOnline(ultimaAtividadeTimestamp) {
  if (!ultimaAtividadeTimestamp) return false
  const agora = Date.now()
  const ultimaAtividade = ultimaAtividadeTimestamp.toMillis()
  return agora - ultimaAtividade < 120000
}

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('buscar')
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [vagaEditando, setVagaEditando] = useState(null)

  const { online } = useOnlineStatus(estabelecimento?.uid)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        try {
          const docRef = doc(db, 'usuarios', usuario.uid)
          const snap = await getDoc(docRef)
          if (snap.exists() && snap.data().tipo === 'estabelecimento') {
            setEstabelecimento({ uid: usuario.uid, ...snap.data() })
            await updateDoc(docRef, { ultimaAtividade: serverTimestamp() })
          } else {
            setEstabelecimento(null)
          }
        } catch (err) {
          console.error('Erro ao buscar dados do estabelecimento:', err)
          setEstabelecimento(null)
        }
      } else {
        setEstabelecimento(null)
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const interval = setInterval(() => {
      updateDoc(doc(db, 'usuarios', estabelecimento.uid), {
        ultimaAtividade: serverTimestamp()
      }).catch(console.error)
    }, 30000)

    return () => clearInterval(interval)
  }, [estabelecimento?.uid])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'chamadas'),
        where('estabelecimentoUid', '==', estabelecimento.uid),
        where('status', '==', 'finalizado'),
        where('checkOutFreela', '==', true),
        where('checkOutEstabelecimento', '==', false)
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const chamada = change.doc.data()

            const audio = new Audio('/sons/checkout.mp3')
            audio.play().catch(() => {
              console.warn('Erro ao tocar som de checkout.')
            })

            toast.success(`O freela ${chamada.freelaNome} finalizou o serviço. Confirme o check-out.`)
          }
        })
      }
    )

    return () => unsubscribe()
  }, [estabelecimento?.uid])

  const abrirEdicao = (vaga) => {
    setVagaEditando(vaga)
    setAba('publicar')
  }

  const onSalvarSucesso = () => {
    setVagaEditando(null)
    setAba('minhas-vagas')
  }

  const handleLogout = async () => {
    try {
      if (estabelecimento?.uid) {
        await updateDoc(doc(db, 'usuarios', estabelecimento.uid), { ultimaAtividade: serverTimestamp() })
      }
      await signOut(auth)
      localStorage.removeItem('usuarioLogado')
      navigate('/login')
    } catch (err) {
      alert('Erro ao sair.')
      console.error(err)
    }
  }

  const renderConteudo = () => {
    if (!estabelecimento) {
      return (
        <p className="text-center text-red-600 mt-10 font-semibold">
          Acesso não autorizado.
        </p>
      )
    }

    switch (aba) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} vaga={vagaEditando} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'historico':
        return <HistoricoChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacaoFreela estabelecimento={estabelecimento} />
      case 'publicar':
        return (
          <PublicarVaga
            estabelecimento={estabelecimento}
            vaga={vagaEditando}
            onSucesso={onSalvarSucesso}
          />
        )
      case 'minhas-vagas':
        return <MinhasVagas estabelecimento={estabelecimento} onEditar={abrirEdicao} />
      case 'candidaturas':
        return <CandidaturasEstabelecimento estabelecimentoUid={estabelecimento.uid} />
      default:
        return <MinhasVagas estabelecimento={estabelecimento} onEditar={abrirEdicao} />
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg font-semibold">Carregando painel...</p>
      </div>
    )
  }

  if (!estabelecimento) {
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
            📊 Painel do Estabelecimento
            <span className={`text-sm font-semibold ${online ? 'text-green-600' : 'text-gray-400'}`}>
              ● {online ? 'Online' : 'Offline'}
            </span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/editarperfilestabelecimento')}
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
          <ul className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
            {[ 
              { key: 'buscar', label: '🔍 Buscar Freelancers' },
              { key: 'agendas', label: '📅 Agendas' },
              { key: 'avaliacao', label: '⭐ Avaliar' },
              { key: 'publicar', label: '📢 Publicar Vaga' },
              { key: 'minhas-vagas', label: '📋 Minhas Vagas' },
              { key: 'candidaturas', label: '📋 Candidaturas' },
              { key: 'historico', label: '📜 Histórico' }
            ].map(({ key, label }) => (
              <li key={key} className="list-none">
                <button
                  onClick={() => {
                    setVagaEditando(null)
                    setAba(key)
                  }}
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

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  )
}
