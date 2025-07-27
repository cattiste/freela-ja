import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { usePresence } from '@/hooks/usePresence'

// Componentes das abas
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreelaCard from '@/pages/freela/PerfilFreela'
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
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [alertas, setAlertas] = useState({
    chamadas: false,
    agenda: false,
    avaliacoes: false,
    recebimentos: false
  })

  const [chamadaAtiva, setChamadaAtiva] = useState(null)
  const freelaId = usuario?.uid

  // 👀 Diagnóstico inicial
  console.log('[PainelFreela] Usuário carregando:', carregando)
  console.log('[PainelFreela] UID freela:', freelaId)

  // ✅ Protege contra UID nulo
  useEffect(() => {
    if (freelaId) usePresence(freelaId)
  }, [freelaId])

  // 🟠 Listeners de alertas
  useEffect(() => {
    if (!freelaId) return

    try {
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
    } catch (e) {
      console.error('[PainelFreela] Erro nos listeners de alertas:', e)
    }
  }, [freelaId])

  // 🟢 Monitoramento de chamada ativa
  useEffect(() => {
    if (!freelaId) return

    try {
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
    } catch (e) {
      console.error('[PainelFreela] Erro no snapshot de chamadas ativas:', e)
    }
  }, [freelaId])

  // ⚠️ Proteções de estado
  if (carregando) return <div className="text-center mt-10 text-orange-600">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10 text-red-600">Usuário não autenticado.</div>

  const renderConteudo = () => {
    try {
      switch (abaSelecionada) {
        case 'perfil':
          return (
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <PerfilFreelaCard freelaId={freelaId} />
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
          return <div className="text-center text-gray-500">Aba não encontrada.</div>
      }
    } catch (e) {
      console.error('[PainelFreela] Erro ao renderizar aba:', e)
      return <div className="text-center text-red-600">Erro ao carregar conteúdo. Verifique os componentes da aba.</div>
    }
  }

  return (
    <div className="p-4 pb-20">
      {renderConteudo()}
      <MenuInferiorFreela
        onSelect={setAbaSelecionada}
        abaAtiva={abaSelecionada}
        alertas={alertas}
      />
    </div>
  )
}
