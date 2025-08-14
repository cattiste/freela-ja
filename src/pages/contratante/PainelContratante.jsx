// src/pages/contratante/PainelContratante.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'
import { useRealtimePresence } from '@/hooks/useRealtimePresence'

import MenuInferiorContratante from '@/components/MenuInferiorContratante'
import PerfilContratanteCard from './PerfilContratanteCard'
import ChamadasContratante from './ChamadasContratante'
import AvaliacoesRecebidasContratante from './AvaliacoesRecebidasContratante'
import AgendasContratadas from '@/components/AgendasContratadas'

export default function PainelContratante() {
  const { usuario, carregando } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', usuario.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = []
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsub()
  }, [usuario?.uid])

  if (carregando || !usuario?.uid) {
    return <div className="p-6 text-center">Carregando…</div>
  }

  return (
    <div className="pb-20">
      <div className="p-4 space-y-4">
        <PerfilContratanteCard usuario={usuario} />

        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-2">Agenda</h2>
          <AgendaContratante usuario={usuario} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-2">Avaliações Recebidas</h2>
          <AvaliacoesRecebidasContratante uid={usuario.uid} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-2">Chamadas Ativas</h2>
          <ChamadasContratante chamadas={chamadas} />
        </div>
      </div>

      <MenuInferiorContratante />
    </div>
  )
}
