// src/pages/estabelecimento/PainelEstabelecimento.jsx
import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  doc, updateDoc, serverTimestamp,
  collection, getDocs, query, where
} from 'firebase/firestore'
import { db } from '@/firebase'

// lazy seguro com fallback visual no caso de erro de import
const SafeLazy = (loader, name) =>
  lazy(() =>
    loader().catch((err) => {
      console.error(`[PainelEstabelecimento] Falha ao carregar ${name}:`, err)
      const Fallback = () => (
        <div className="p-4 rounded-lg border border-red-300 bg-red-50 text-red-700">
          {`Falha ao carregar ${name}. Veja o console para detalhes.`}
        </div>
      )
      return { default: Fallback }
    })
  )

const MenuInferiorEstabelecimento = SafeLazy(() => import('@/components/MenuInferiorEstabelecimento'), 'MenuInferiorEstabelecimento')
const BuscarFreelas = SafeLazy(() => import('@/components/BuscarFreelas'), 'BuscarFreelas')
const AgendasContratadas = SafeLazy(() => import('@/components/AgendasContratadas'), 'AgendasContratadas')
const VagasEstabelecimentoCompleto = SafeLazy(() => import('@/components/VagasEstabelecimentoCompleto'), 'VagasEstabelecimentoCompleto')
const AvaliacoesRecebidasEstabelecimento = SafeLazy(() => import('@/pages/estabelecimento/AvaliacoesRecebidasEstabelecimento'), 'AvaliacoesRecebidasEstabelecimento')
const HistoricoChamadasEstabelecimento = SafeLazy(() => import('@/components/HistoricoChamadasEstabelecimento'), 'HistoricoChamadasEstabelecimento')
const ChamadasEstabelecimento = SafeLazy(() => import('@/pages/estabelecimento/ChamadasEstabelecimento'), 'ChamadasEstabelecimento')
const CardAvaliacaoFreela = SafeLazy(() => import('@/components/CardAvaliacaoFreela'), 'CardAvaliacaoFreela')
const Calendar = SafeLazy(() => import('react-calendar'), 'react-calendar')

import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

// ErrorBoundary simples para impedir tela branca
class ErrorBoundary extends React.Component {
  constructor(p) {
    super(p)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[PainelEstabelecimento] erro capturado:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 rounded-xl border border-red-300 bg-red-50 text-red-700">
          <div className="font-bold mb-1">Ocorreu um erro ao renderizar esta seção.</div>
          <div className="text-xs break-all">{String(this.state.error)}</div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function PainelEstabelecimento() {
  const { usuario, carregando } = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  // lê ?tab=perfil|buscar|agendas|vagas|avaliacao|historico|ativas|chamadas
  const getTabFromURL = () => {
    const p = new URLSearchParams(location.search)
    return p.get('tab') || 'perfil'
  }
  const [abaSelecionada, setAbaSelecionada] = useState(getTabFromURL())

  useEffect(() => {
    setAbaSelecionada(getTabFromURL())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const estabelecimento = useMemo(
    () => (usuario?.tipo === 'estabelecimento' ? usuario : null),
    [usuario]
  )

  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [agendaPerfil, setAgendaPerfil] = useState({})

  // placeholder: presença online (desligado por enquanto)
  const usuariosOnline = {}

  useEffect(() => {
    if (!estabelecimento?.uid) return
    ;(async () => {
      try {
        await updateDoc(doc(db, 'usuarios', estabelecimento.uid), {
          ultimaAtividade: serverTimestamp()
        })
      } catch (err) {
        console.warn('[PainelEstabelecimento] ultimaAtividade falhou:', err)
      }
    })()
  }, [estabelecimento?.uid])

  useEffect(() => {
    if (!estabelecimento?.uid) return
    carregarAgenda(estabelecimento.uid)
    carregarAvaliacoesPendentes(estabelecimento.uid)
  }, [estabelecimento?.uid])

  async function carregarAgenda(uid) {
    try {
      const ref = collection(db, 'usuarios', uid, 'agenda')
      const snap = await getDocs(ref)
      const datas = {}
      snap.docs.forEach((d) => (datas[d.id] = d.data()))
      setAgendaPerfil(datas)
    } catch (err) {
      console.error('[PainelEstabelecimento] erro agenda:', err)
    }
  }

  async function carregarAvaliacoesPendentes(uid) {
    try {
      const ref = collection(db, 'chamadas')
      const q = query(ref, where('estabelecimentoUid', '==', uid), where('status', '==', 'concluido'))
      const snap = await getDocs(q)
      const pendentes = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !c.avaliacaoFreela?.nota)
      setAvaliacoesPendentes(pendentes)
    } catch (err) {
      console.error('[PainelEstabelecimento] erro aval pendentes:', err)
    }
  }

  // atualizar URL ao trocar de aba — sincroniza state + query string
  const handleSelectAba = (aba) => {
    const params = new URLSearchParams(location.search)
    params.set('tab', aba)
    nav(`${location.pathname}?${params.toString()}`, { replace: true })
    setAbaSelecionada(aba)
  }

  function renderPerfil() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
            <img
              src={estabelecimento?.foto || '/img/placeholder-100.png'}
              alt={estabelecimento?.nome || 'Estabelecimento'}
              className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
              onError={(e) => (e.currentTarget.src = '/img/placeholder-100.png')}
            />
            <h2 className="text-center text-xl font-bold text-orange-700">
              {estabelecimento?.nome || 'Sem nome'}
            </h2>
            <div className="text-sm text-gray-700 space-y-1 mt-3">
              <p>📞 {estabelecimento?.celular || 'Telefone não informado'}</p>
              <p>📧 {estabelecimento?.email}</p>
              <p>📍 {estabelecimento?.endereco || 'Endereço não informado'}</p>
              <p>🧾 {estabelecimento?.cnpj || 'CNPJ não informado'}</p>
            </div>

            <button
              onClick={() => nav('/estabelecimento/editarperfil')}
              className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
            >
              ✏️ Editar Perfil
            </button>
          </div>

          <ErrorBoundary>
            <Suspense fallback={<div className="p-4">Carregando agenda…</div>}>
              <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
                <h3 className="text-lg font-bold text-orange-700 mb-2">Minha Agenda</h3>
                <Calendar
                  tileContent={({ date }) => {
                    const dia = date.toISOString().split('T')[0]
                    if (agendaPerfil[dia]) {
                      return (
                        <div className="text-xs text-orange-700 font-bold mt-1">
                          📌 {agendaPerfil[dia].nota || 'Ocupado'}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Clique em uma data na aba "Agendas" para adicionar ou remover compromissos.
                </p>
              </div>
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
              <h3 className="font-bold text-orange-700 mb-2">Freelas a Avaliar</h3>
              <Suspense fallback={<div>Carregando avaliações…</div>}>
                {avaliacoesPendentes.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum freela para avaliar no momento.</p>
                ) : (
                  avaliacoesPendentes.map((chamada) => (
                    <CardAvaliacaoFreela
                      key={chamada.id}
                      chamada={chamada}
                      onAvaliado={() => carregarAvaliacoesPendentes(estabelecimento.uid)}
                    />
                  ))
                )}
              </Suspense>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    )
  }

  function renderConteudo() {
    switch (abaSelecionada) {
      case 'perfil':
        return renderPerfil()
      case 'buscar':
        return (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-4">Carregando busca…</div>}>
              <BuscarFreelas usuario={estabelecimento} usuariosOnline={usuariosOnline} />
            </Suspense>
          </ErrorBoundary>
        )
      case 'agendas':
        return (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-4">Carregando agendas…</div>}>
              <AgendasContratadas estabelecimento={estabelecimento} />
            </Suspense>
          </ErrorBoundary>
        )
      case 'vagas':
        return (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-4">Carregando vagas…</div>}>
              <VagasEstabelecimentoCompleto estabelecimento={estabelecimento} />
            </Suspense>
          </ErrorBoundary>
        )
      case 'avaliacao':
        return (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-4">Carregando avaliações…</div>}>
              <AvaliacoesRecebidasEstabelecimento />
            </Suspense>
          </ErrorBoundary>
        )
      case 'historico':
        return (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-4">Carregando histórico…</div>}>
              <HistoricoChamadasEstabelecimento estabelecimento={estabelecimento} />
            </Suspense>
          </ErrorBoundary>
        )
      case 'ativas':
      case 'chamadas':
        return (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-4">Carregando chamadas…</div>}>
              <ChamadasEstabelecimento estabelecimento={estabelecimento} />
            </Suspense>
          </ErrorBoundary>
        )
      default:
        return null
    }
  }

  // estados de carregamento/segurança
  if (carregando) return <div className="text-center text-orange-600 mt-8">Carregando painel…</div>
  if (usuario?.uid && usuario?.tipo !== 'estabelecimento') {
    if (usuario?.tipo === 'freela') return <Navigate to="/painel/freela" replace />
    if (usuario?.tipo === 'pessoa_fisica') return <Navigate to="/painel/pf" replace />
    return <Navigate to="/" replace />
  }
  if (!usuario?.uid) return <Navigate to="/login" replace />

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <ErrorBoundary>
        <Suspense fallback={<div className="p-4">Carregando painel…</div>}>
          {renderConteudo()}
          <Suspense fallback={<div className="p-4">Carregando menu…</div>}>
            <MenuInferiorEstabelecimento
              onSelect={handleSelectAba}
              abaAtiva={abaSelecionada}
            />
          </Suspense>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
