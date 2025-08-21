
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

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
import ValidacaoDocumento from '@/components/ValidacaoDocumento'


import { useRealtimePresence } from '@/hooks/useRealtimePresence'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [alertas, setAlertas] = useState({
    chamadas: false,
    agenda: false,
    avaliacoes: false,
    recebimentos: false,
  })
  const [chamadaAtiva, setChamadaAtiva] = useState(null)

  useRealtimePresence(usuario)

  useEffect(() => {
    if (!usuario?.uid) return

    const unsubChamadas = onSnapshot(
      query(
        collection(db, 'chamadas'),
        where('freelaUid', '==', usuario.uid),
        where('status', '==', 'pendente')
      ),
      (snap) => setAlertas((prev) => ({ ...prev, chamadas: snap.size > 0 }))
    )

    const unsubEventos = onSnapshot(
      query(collection(db, 'eventos'), where('ativo', '==', true)),
      (snap) => setAlertas((prev) => ({ ...prev, agenda: snap.size > 0 }))
    )

    const unsubVagas = onSnapshot(
      query(collection(db, 'vagas'), where('status', '==', 'aberta')),
      (snap) => setAlertas((prev) => ({ ...prev, agenda: snap.size > 0 }))
    )

    const unsubAvaliacoes = onSnapshot(
      query(collection(db, 'avaliacoesFreelas'), where('freelaUid', '==', usuario.uid)),
      (snap) => setAlertas((prev) => ({ ...prev, avaliacoes: snap.size > 0 }))
    )

    const unsubRecebimentos = onSnapshot(
      query(
        collection(db, 'chamadas'),
        where('freelaUid', '==', usuario.uid),
        where('status', 'in', ['finalizado', 'concluido'])
      ),
      (snap) => setAlertas((prev) => ({ ...prev, recebimentos: snap.size > 0 }))
    )

    return () => {
      unsubChamadas()
      unsubEventos()
      unsubVagas()
      unsubAvaliacoes()
      unsubRecebimentos()
    }
  }, [usuario?.uid])

  useEffect(() => {
    if (!usuario?.uid) return
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela'])
    )
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setChamadaAtiva(docs[0] || null)
    })
    return () => unsubscribe()
  }, [usuario?.uid])

  if (carregando) return <div className="text-center mt-10">Verificando autenticação...</div>
  if (!usuario?.uid) return <div className="text-center mt-10">Usuário não autenticado.</div>

  const role = (usuario?.tipo || usuario?.tipoUsuario || '').toLowerCase()
  if (role && role !== 'freela') {
    return (
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-600">
          Papel atual: <b>{role}</b> — esta tela é específica para freela.
        </div>
      </div>
    )
  }

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <PerfilFreela freelaId={usuario.uid} />
            <AgendaFreela freela={usuario} />
            <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
          </div>
        )
      case 'agenda':
        return <AgendaCompleta freela={usuario} />
      case 'chamadas':
        return <ChamadasFreela />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
      case 'eventos':
        return <Eventos freelaId={usuario.uid} />
      case 'vagas':
        return <Vagas freelaId={usuario.uid} />
      case 'config':
        return (
          <>
            <ConfiguracoesFreela />
            <ValidacaoDocumento />
          </>
        )
      case 'historico':
        return <HistoricoFreela freelaId={usuario.uid} />
      case 'recebimentos':
        return <RecebimentosFreela freelaId={usuario.uid} />
      default:
        return null
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
