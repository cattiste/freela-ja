import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { db } from '@/firebase'
import {
  doc,
  setDoc,
  collection,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'

export default function AgendaFreela({ freela }) {
  const [datasOcupadas, setDatasOcupadas] = useState([])

  useEffect(() => {
    if (!freela?.uid) return

    // Referência para a subcoleção 'agenda' do usuário
    const ref = collection(db, 'usuarios', freela.uid, 'agenda')

    // Escutar em tempo real as datas ocupadas
    const unsubscribe = onSnapshot(ref, snapshot => {
      const datas = snapshot.docs.map(doc => doc.id)
      setDatasOcupadas(datas)
    })

    return () => unsubscribe()
  }, [freela])

  // Função para marcar a data como ocupada (criar doc na subcoleção)
  const marcarData = async (date) => {
    const dia = date.toISOString().split('T')[0] // yyyy-mm-dd
    const ref = doc(db, 'usuarios', freela.uid, 'agenda', dia)
    await setDoc(ref, { ocupado: true })
  }

  // Função para desmarcar a data (remover doc da subcoleção)
  const desmarcarData = async (date) => {
    const dia = date.toISOString().split('T')[0]
    const ref = doc(db, 'usuarios', freela.uid, 'agenda', dia)
    await deleteDoc(ref)
  }

  // Desabilitar datas já ocupadas para evitar múltiplos cliques confusos
  const tileDisabled = ({ date }) => {
    const dia = date.toISOString().split('T')[0]
    return false // permite clicar em todas as datas, mas vamos controlar via confirmação
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">📆 Minha Agenda</h2>
      <Calendar
        onClickDay={async (date) => {
          const dia = date.toISOString().split('T')[0]

          if (datasOcupadas.includes(dia)) {
            const confirmDesmarcar = window.confirm('Deseja liberar essa data da agenda?')
            if (confirmDesmarcar) {
              await desmarcarData(date)
            }
          } else {
            await marcarData(date)
          }
        }}
        tileDisabled={tileDisabled}
        // Mostra visual diferente para datas ocupadas
        tileClassName={({ date }) => {
          const dia = date.toISOString().split('T')[0]
          return datasOcupadas.includes(dia) ? 'bg-red-200 text-red-800 font-bold' : null
        }}
      />
      <p className="text-sm text-gray-500 mt-4">
        Clique em uma data para marcar como ocupada. Para liberar, clique novamente e confirme.
      </p>
    </div>
  )
}
