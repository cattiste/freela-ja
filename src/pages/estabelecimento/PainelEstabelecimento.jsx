// src/pages/estabelecimento/PainelEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { onSnapshot, query, collection, where, doc as docRef } from 'firebase/firestore'
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
import ConfigPagamentoEstabelecimento from '@/pages/estabelecimento/ConfigPagamentoEstabelecimento'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const { rota } = useParams()
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [vagaEditando, setVagaEditando] = useState(null)

  // Passa o UID corretamente para o hook
  const { online } = useOnlineStatus(estabelecimento?.uid)

  // Autentica e busca dados do estabelecimento
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

  // Atualiza última atividade a cada 30s
  useEffect(() => {
    if (!estabelecimento?.uid) return
    const iv = setInterval(() => {
      updateDoc(docRef(db, 'usuarios', estabelecimento.uid), {
        ultimaAtividade: serverTimestamp()
      }).catch(console.error)
    }, 30000)
    return () => clearInterval(iv)
  }, [estabelecimento])

  // Notifica checkout pendente
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
      await updateDoc(docRef(db, 'usuarios', estabelecimento.uid), {
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
      case 'config-pagamento':
        return <ConfigPagamentoEstabelecimento usuario={estabelecimento} />
      default:
        return <BuscarFreelas estabelecimento={estabelecimento} vaga={vagaEditando} />
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-orange-700 flex items-center gap-3">
            📊 Painel do Estabelecimento
            <span className={`text-sm font-semibold ${online ? 'text-green-600' : 'text-gray-400'}`}>
              ● {online ? 'Online' : 'Offline'}
            </span>
          </h1>

        <nav className="border-b border-orange-300 mb-6 overflow-x-auto">
          <ul className="flex space-x-2 whitespace-nowrap">
            {[
              ['buscar', '🔍 Buscar Freelancers'],
              ['agendas', '📅 Agendas'],
              ['avaliacao', '⭐ Avaliar'],
              ['publicar', '📢 Publicar Vaga'],
              ['minhas-vagas', '📋 Minhas Vagas'],
              ['candidaturas', '📄 Candidaturas'],
              ['historico', '📜 Histórico'],
              ['config-pagamento', '⚙️ Configurações & Pagamentos']
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
                      : 'border-transparent text-gray-400 hover:text-orange-600 hover:border-orange-400'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Conteúdo dinâmico */}
        <section>{renderConteudo()}</section>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  )
}
