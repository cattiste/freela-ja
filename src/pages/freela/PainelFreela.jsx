// ✅ src/pages/freela/PainelFreela.jsx completo com alertas visuais
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
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
import EditarFreela from '@/pages/freela/EditarFreela'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [alertas, setAlertas] = useState({ chamadas: false, agenda: false, avaliacoes: false, recebimentos: false })

  const freelaId = usuario?.uid

  useEffect(() => {
  if (!usuario?.uid) return

  const interval = setInterval(() => {
    const ref = doc(db, 'usuarios', usuario.uid)
    updateDoc(ref, { ultimaAtividade: serverTimestamp() }).catch(console.error)
  }, 60 * 100) //

  return () => clearInterval(interval)
}, [usuario?.uid])


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

  if (carregando) return <div className="text-center mt-10">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10">Usuário não autenticado.</div>

  const renderConteudo = () => {
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
