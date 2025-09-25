// PainelContratante.jsx unificado para todos os contratantes
import React, { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  doc, updateDoc, serverTimestamp,
  collection, getDocs, query, where
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

import MenuInferiorContratante from '@/components/MenuInferiorContratante'
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasContratanteCompleto from '@/components/VagasContratanteCompleto'
import AvaliacoesRecebidasContratante from '@/pages/contratante/AvaliacoesRecebidasContratante'
import HistoricoChamadasContratante from '@/components/HistoricoChamadasContratante'
import ChamadasContratante from '@/pages/contratante/ChamadasContratante'
import Calendar from 'react-calendar'
import { useRealtimePresence } from '@/hooks/useRealtimePresence'
import ValidacaoDocumento from '@/components/ValidacaoDocumento'

import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, err: null }
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err }
  }
  componentDidCatch(err, info) {
    console.error('[PainelContratante] erro:', err, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 rounded-xl border border-red-300 bg-red-50 text-red-700">
          <div className="font-bold mb-1">Falha ao renderizar uma seção.</div>
          <div className="text-xs break-all">{String(this.state.err)}</div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function PainelContratante() {
  const { usuario, carregando } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const { usuariosOnline } = useRealtimePresence(usuario)
  const [abaSelecionada, setAbaSelecionada] = useState(new URLSearchParams(location.search).get('tab') || 'perfil')
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [agendaPerfil, setAgendaPerfil] = useState({})

  const contratante = useMemo(() => usuario, [usuario])

  useEffect(() => {
    setAbaSelecionada(new URLSearchParams(location.search).get('tab') || 'perfil')
  }, [location.search])

  useEffect(() => {
    if (!contratante?.uid) return
    updateDoc(doc(db, 'usuarios', contratante.uid), {
      ultimaAtividade: serverTimestamp(),
      tipo: 'contratante' // ✅ força contratante
    }).catch(err => console.warn('[PainelContratante] ultimaAtividade falhou:', err))
  }, [contratante?.uid])

  useEffect(() => {
    if (!contratante?.uid) return
    carregarAgenda(contratante.uid)
    carregarAvaliacoesPendentes(contratante.uid)
  }, [contratante?.uid])

  useEffect(() => {
    if (usuario?.statusDocumentos === 'aprovada') {
      toast.success('✅ Documentos verificados com sucesso!')
    }
  }, [usuario?.statusDocumentos])

  async function carregarAgenda(uid) {
    try {
      const ref = collection(db, 'usuarios', uid, 'agenda')
      const snap = await getDocs(ref)
      const datas = {}
      snap.docs.forEach((d) => (datas[d.id] = d.data()))
      setAgendaPerfil(datas)
    } catch (err) {
      console.error('[PainelContratante] erro agenda:', err)
    }
  }

  async function carregarAvaliacoesPendentes(uid) {
    try {
      const ref = collection(db, 'chamadas')
      const q = query(ref, where('contratanteUid', '==', uid), where('status', '==', 'concluido'))
      const snap = await getDocs(q)
      const pendentes = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !c.avaliadoPeloContratante)
      setAvaliacoesPendentes(pendentes)
    } catch (err) {
      console.error('[PainelContratante] erro aval pendentes:', err)
    }
  }

  function renderPerfil() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
            <img
              src={contratante?.foto || '/img/placeholder-100.png'}
              alt={contratante?.nome || 'Contratante'}
              className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
              onError={(e) => (e.currentTarget.src = '/img/placeholder-100.png')}
            />
            <h2 className="text-center text-xl font-bold text-orange-700">
              {contratante?.nome || 'Sem nome'}
            </h2>
            <div className="text-sm text-gray-700 space-y-1 mt-3">
              <p>📞 {contratante?.celular || 'Telefone não informado'}</p>
              <p>📧 {contratante?.email}</p>
              <p>📍 {contratante?.endereco || 'Endereço não informado'}</p>
              <p>🧾 {contratante?.cpf || contratante?.cnpj || 'Documento não informado'}</p>
            </div>

            <button
              onClick={() => nav('/contratante/editarperfilcontratante')}
              className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
            >
              ✏️ Editar Perfil
            </button>
          </div>

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
                        onClick={() => carregarAvaliacoesPendentes(contratante.uid)}
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

  function renderConteudo() {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <>
            {renderPerfil()}
            {usuario?.statusDocumentos !== 'aprovado' && <ValidacaoDocumento />}
          </>
        )
      case 'buscar':
        return <BuscarFreelas usuario={contratante} usuariosOnline={usuariosOnline} />
      case 'agendas':
        return <AgendasContratadas contratante={contratante} />
      case 'vagas':
        return <VagasContratanteCompleto contratante={contratante} />
      case 'avaliacao':
        return <AvaliacoesRecebidasContratante />
      case 'historico':
        return <HistoricoChamadasContratante contratante={contratante} />
      case 'ativas':
      case 'chamadas':
        return <ChamadasContratante contratante={contratante} />
      default:
        return renderPerfil()
    }
  }

  if (carregando) return <div className="text-center text-orange-600 mt-8">Carregando painel…</div>
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
      <ErrorBoundary>{renderConteudo()}</ErrorBoundary>
      <MenuInferiorContratante onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
