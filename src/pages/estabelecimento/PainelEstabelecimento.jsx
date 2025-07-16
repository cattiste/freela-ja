// src/pages/estabelecimento/PainelEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { onSnapshot, query, collection, where } from 'firebase/firestore'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { toast, Toaster } from 'react-hot-toast'

import { auth, db } from '@/firebase'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import PublicarVaga from '@/pages/estabelecimento/PublicarVaga'
import MinhasVagas from '@/components/MinhasVagas'
import CandidaturasEstabelecimento from '@/components/CandidaturasEstabelecimento'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const { rota } = useParams()
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [vagaEditando, setVagaEditando] = useState(null)

  // agora passa o UID, não o Timestamp
  const { online } = useOnlineStatus(estabelecimento?.uid)

  // autenticação + fetch do perfil
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setEstabelecimento(null)
        setCarregando(false)
        return
      }
      try {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists() && snap.data().tipo === 'estabelecimento') {
          const data = snap.data()
          setEstabelecimento({ uid: user.uid, ...data })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        } else {
          setEstabelecimento(null)
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
        setEstabelecimento(null)
      } finally {
        setCarregando(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // keep-alive da última atividade
  useEffect(() => {
    if (!estabelecimento?.uid) return
    const iv = setInterval(() => {
      updateDoc(doc(db, 'usuarios', estabelecimento.uid), {
        ultimaAtividade: serverTimestamp()
      }).catch(console.error)
    }, 30000)
    return () => clearInterval(iv)
  }, [estabelecimento])

  // notificação de checkout do freela
  useEffect(() => {
    if (!estabelecimento?.uid) return
    const unsub = onSnapshot(
      query(
        collection(db, 'chamadas'),
        where('estabelecimentoUid', '==', estabelecimento.uid),
        where('status', '==', 'checkout_freela'),
        where('checkOutEstabelecimento', '==', false)
      ),
      (snap) => {
        snap.docChanges().forEach(({ doc: d, type }) => {
          if (type === 'added') {
            const data = d.data()
            new Audio('/sons/checkout.mp3').play().catch(() => {})
            toast.success(
              `O freela ${data.freelaNome} finalizou o serviço. Confirme o checkout.`
            )
          }
        })
      }
    )
    return () => unsub()
  }, [estabelecimento])

  const handleLogout = async () => {
    if (estabelecimento?.uid) {
      await updateDoc(doc(db, 'usuarios', estabelecimento.uid), {
        ultimaAtividade: serverTimestamp()
      })
    }
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const abrirEdicao = (vaga) => {
    setVagaEditando(vaga)
    navigate('/painelestabelecimento/publicar')
  }
  const onSalvarSucesso = () => {
    setVagaEditando(null)
    navigate('/painelestabelecimento/minhas-vagas')
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

  const aba = rota || 'buscar'
  const renderConteudo = () => {
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
        return <BuscarFreelas estabelecimento={estabelecimento} vaga={vagaEditando} />
    }
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
              className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
            >
              ✏️ Editar Perfil
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🔒 Logout
            </button>
          </div>
        </div>

        <nav className="border-b border-orange-300 mb-6 overflow-x-auto">
          <ul className="flex space-x-2 whitespace-nowrap">
            {[
              ['buscar', '🔍 Buscar Freelancers'],
              ['agendas', '📅 Agendas'],
              ['avaliacao', '⭐ Avaliar'],
              ['publicar', '📢 Publicar Vaga'],
              ['minhas-vagas', '📋 Minhas Vagas'],
              ['candidaturas', '📄 Candidaturas'],
              ['historico', '📜 Histórico']
            ].map(([key, label]) => (
              <li key={key}>
                <button
                  onClick={() => {
                    setVagaEditando(null)
                    navigate(`/painelestabelecimento/${key}`)
                  }}
                  className={`px-4 py-2 border-b-2 font-semibold transition ${
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
