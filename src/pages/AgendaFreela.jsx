import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { db } from '@/firebase'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'

export default function AgendaFreela({ freela }) {
  const [datasOcupadas, setDatasOcupadas] = useState([])

  useEffect(() => {
    if (!freela?.uid) return

    const ref = collection(db, 'usuarios', freela.uid, 'agenda')
    const unsubscribe = onSnapshot(ref, snapshot => {
      const datas = snapshot.docs.map(doc => doc.id)
      setDatasOcupadas(datas)
    })

    return () => unsubscribe()
  }, [freela])

  const marcarData = async (date) => {
    const dia = date.toISOString().split('T')[0]
    const ref = doc(db, 'usuarios', freela.uid, 'agenda', dia)
    await setDoc(ref, { ocupado: true })
  }

  const desmarcarData = async (date) => {
    const dia = date.toISOString().split('T')[0]
    const ref = doc(db, 'usuarios', freela.uid, 'agenda', dia)
    await deleteDoc(ref)
  }

  const tileDisabled = ({ date }) => {
    const dia = date.toISOString().split('T')[0]
    return false // nenhuma data desabilitada para interação
  }

  const tileContent = ({ date, view }) => {
    const dia = date.toISOString().split('T')[0]
    if (view === 'month' && datasOcupadas.includes(dia)) {
      return <div className="dot-indicator" />
    }
    return null
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">📆 Minha Agenda</h2>
      <Calendar
        onClickDay={async (date) => {
          const dia = date.toISOString().split('T')[0]
          if (datasOcupadas.includes(dia)) {
            const confirm = window.confirm('Deseja liberar essa data da agenda?')
            if (confirm) {
              await desmarcarData(date)
            }
          } else {
            await marcarData(date)
          }
        }}
        tileDisabled={tileDisabled}
        tileContent={tileContent}
      />
      <p className="text-sm text-gray-500 mt-4">
        Clique em uma data para marcar como ocupada. Para liberar, clique novamente e confirme.
      </p>
    </div>
  )
}
