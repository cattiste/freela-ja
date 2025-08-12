// src/pages/estabelecimento/PainelEstabelecimento.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  doc, updateDoc, serverTimestamp,
  collection, getDocs, query, where
} from 'firebase/firestore'
import { db } from '@/firebase'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

// Componentes
import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasEstabelecimentoCompleto from '@/components/VagasEstabelecimentoCompleto'
import AvaliacoesRecebidasEstabelecimento from '@/pages/estabelecimento/AvaliacoesRecebidasEstabelecimento'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'

// ErrorBoundary atualizado
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('[PainelEstabelecimento] ErrorBoundary capturou:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 rounded-xl border border-red-300 bg-red-50 text-red-700">
          <div className="font-bold mb-1">Erro no componente</div>
          <div className="text-sm">{this.state.error?.message || 'Erro desconhecido'}</div>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm underline"
          >
            Tentar novamente
          </button>
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

  // Estado e lógica para abas
  const getTabFromURL = () => new URLSearchParams(location.search).get('tab') || 'perfil'
  const [abaSelecionada, setAbaSelecionada] = useState(getTabFromURL())
  useEffect(() => { setAbaSelecionada(getTabFromURL()) }, [location.search])

  const estabelecimento = useMemo(
    () => (usuario?.tipo === 'estabelecimento' ? usuario : null),
    [usuario]
  )

  // Estados para dados
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [agendaPerfil, setAgendaPerfil] = useState({})
  const [usuariosOnline] = useState({}) // placeholder

  // Atualiza última atividade
  useEffect(() => {
    if (!estabelecimento?.uid) return
    
    const updateActivity = async () => {
      try {
        await updateDoc(doc(db, 'usuarios', estabelecimento.uid), {
          ultimaAtividade: serverTimestamp()
        })
      } catch (err) {
        console.warn('[PainelEstabelecimento] Erro ao atualizar atividade:', err)
      }
    }
    
    updateActivity()
  }, [estabelecimento?.uid])

  // Carrega dados do perfil
  useEffect(() => {
    if (!estabelecimento?.uid) return

    const carregarDados = async () => {
      try {
        await Promise.all([
          carregarAgenda(estabelecimento.uid),
          carregarAvaliacoesPendentes(estabelecimento.uid)
        ])
      } catch (err) {
        console.error('[PainelEstabelecimento] Erro ao carregar dados:', err)
      }
    }

    carregarDados()
  }, [estabelecimento?.uid])

  async function carregarAgenda(uid) {
    try {
      const ref = collection(db, 'usuarios', uid, 'agenda')
      const snap = await getDocs(ref)
      const datas = {}
      snap.docs.forEach((d) => (datas[d.id] = d.data()))
      setAgendaPerfil(datas)
    } catch (err) {
      console.error('[PainelEstabelecimento] Erro ao carregar agenda:', err)
    }
  }

  async function carregarAvaliacoesPendentes(uid) {
    try {
      const ref = collection(db, 'chamadas')
      const q = query(
        ref, 
        where('estabelecimentoUid', '==', uid), 
        where('status', '==', 'concluido')
      )
      const snap = await getDocs(q)
      const pendentes = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !c.avaliacaoFreela?.nota)
      setAvaliacoesPendentes(pendentes)
    } catch (err) {
      console.error('[PainelEstabelecimento] Erro ao carregar avaliações pendentes:', err)
    }
  }

  // Renderização do perfil
  function renderPerfil() {
    if (!estabelecimento) return null

    return (
      <div className="space-y-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card de Perfil */}
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

          {/* Card de Agenda */}
          <ErrorBoundary>
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
          </ErrorBoundary>

          {/* Card de Avaliações Pendentes */}
          <ErrorBoundary>
            <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
              <h3 className="font-bold text-orange-700 mb-2">Freelas a Avaliar</h3>
              {avaliacoesPendentes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum freela para avaliar no momento.</p>
              ) : (
                <div className="space-y-3">
                  {avaliacoesPendentes.map((ch) => (
                    <div key={ch.id} className="border rounded p-3">
                      <p className="text-sm"><span className="font-semibold">Freela:</span> {ch.freelaNome || '—'}</p>
                      <p className="text-xs text-gray-500">Chamada: {ch.id}</p>
                      <button
                        className="mt-2 text-xs bg-orange-600 text-white px-3 py-1 rounded"
                        onClick={() => nav(`/avaliar/freela/${ch.freelaUid}?chamada=${ch.id}`)}
                      >
                        Avaliar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    )
  }

  // Renderização do conteúdo principal
  function renderConteudo() {
    if (!estabelecimento) return null

    switch (abaSelecionada) {
      case 'perfil':
        return renderPerfil()
      case 'buscar':
        return <BuscarFreelas usuario={estabelecimento} usuariosOnline={usuariosOnline} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'vagas':
        return <VagasEstabelecimentoCompleto estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacoesRecebidasEstabelecimento />
      case 'historico':
        return <HistoricoChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'ativas':
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      default:
        return renderPerfil()
    }
  }

  // Verificações de estado e segurança
  if (carregando) {
    return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  }

  if (!usuario?.uid) {
    return <Navigate to="/login" replace />
  }

  if (usuario?.uid && usuario?.tipo !== 'estabelecimento') {
    if (usuario?.tipo === 'freela') return <Navigate to="/painelfreela" replace />
    return <Navigate to="/" replace />
  }

  // Renderização principal
  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 pb-24"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <ErrorBoundary>
        {renderConteudo()}
      </ErrorBoundary>
      
      <MenuInferiorEstabelecimento 
        onSelect={setAbaSelecionada} 
        abaAtiva={abaSelecionada} 
      />
    </div>
  )
}