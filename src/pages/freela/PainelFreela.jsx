// src/pages/freela/PainelFreela.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

import { useRealtimePresence } from '@/hooks/useRealtimePresence'

import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import ChamadasFreela from '@/pages/freela/ChamadasFreela'
import Eventos from '@/pages/freela/EventosDisponiveis'
import Vagas from '@/pages/freela/VagasDisponiveis'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import HistoricoFreela from '@/pages/freela/HistoricoTrabalhosFreela'
import AgendaCompleta from '@/pages/freela/AgendaCompleta'
import RecebimentosFreela from '@/pages/freela/RecebimentosFreela'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()
  const navigate = useNavigate()

  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [alertas, setAlertas] = useState({
    chamadas: false,
    agenda: false,
    avaliacoes: false,
    recebimentos: false
  })
  const [chamadaAtiva, setChamadaAtiva] = useState(null)

  useEffect(() => {
    if (!carregando && usuario && usuario.tipo !== 'freela') {
      navigate('/')
    }
  }, [carregando, usuario])

  const freelaId = usuario?.uid
  useRealtimePresence(freelaId)

  useEffect(() => {
    if (!freelaId) return

    const unsubChamadas = onSnapshot(
      query(collection(db, 'chamadas'), where('freelaUid', '==', freelaId), where('status', '==', 'pendente')),
      (snap) => setAlertas(prev => ({ ...prev, chamadas: snap.size > 0 }))
    )

    const unsubEventos = onSnapshot(
      query(collection(db, 'eventos'), where('ativo', '==', true)),
      (snap) => setAlertas(prev => ({ ...prev, agenda: snap.size > 0 }))
    )

    const unsubVagas = onSnapshot(
      query(collection(db, 'vagas'), where('status', '==', 'aberta')),
      (snap) => setAlertas(prev => ({ ...prev, agenda: snap.size > 0 }))
    )

    const unsubAvaliacoes = onSnapshot(
      query(collection(db, 'avaliacoesFreelas'), where('freelaUid', '==', freelaId)),
      (snap) => setAlertas(prev => ({ ...prev, avaliacoes: snap.size > 0 }))
    )

    const unsubRecebimentos = onSnapshot(
      query(collection(db, 'chamadas'), where('freelaUid', '==', freelaId), where('status', 'in', ['finalizado', 'concluido'])),
      (snap) => setAlertas(prev => ({ ...prev, recebimentos: snap.size > 0 }))
    )

    return () => {
      unsubChamadas()
      unsubEventos()
      unsubVagas()
      unsubAvaliacoes()
      unsubRecebimentos()
    }
  }, [freelaId])

  useEffect(() => {
    if (!freelaId) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', freelaId),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChamadaAtiva(docs[0] || null)
    })

    return () => unsubscribe()
  }, [freelaId])

  if (carregando) return <div className="text-center mt-10">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10">Usuário não autenticado.</div>

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <PerfilFreela freelaId={freelaId || ''} />
            <AgendaFreela freela={usuario} />
            <AvaliacoesRecebidasFreela freelaUid={freelaId} />
          </div>
        )
      case 'agenda':
        return <AgendaCompleta freelaId={freelaId} />
      case 'chamadas':
        return <ChamadasFreela />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={freelaId} />
      case 'eventos':
        return <Eventos freelaId={freelaId} />
      case 'vagas':
        return <Vagas freelaId={freelaId} />
      case 'config':
        return <ConfiguracoesFreela freelaId={freelaId} />
      case 'historico':
        return <HistoricoFreela freelaId={freelaId} />
      case 'recebimentos':
        return <RecebimentosFreela freelaId={freelaId} />
      default:
        return null
    }
  }

  return (
    <div className="p-4 pb-20">
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} alertas={alertas} />
    </div>
  )
}
