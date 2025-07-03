import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/styles/Calendar.css'
import { db } from '@/firebase'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'

export default function AgendaFreela({ freela }) {
  const [datasOcupadas, setDatasOcupadas] = useState([]) // lista de strings no formato 'YYYY-MM-DD'
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!freela?.uid) return

    const agendaRef = collection(db, 'usuarios', freela.uid, 'agenda')

    // Ouve as mudanças na subcoleção 'agenda' do freela
    const unsubscribe = onSnapshot(
      agendaRef,
      snapshot => {
        const datas = snapshot.docs.map(doc => doc.id) // as datas são os IDs dos docs
        setDatasOcupadas(datas)
        setCarregando(false)
      },
      error => {
        console.error('Erro ao ouvir agenda:', error)
        setCarregando(false)
      }
    )

    return () => unsubscribe()
  }, [freela?.uid])

  // Marca uma data como ocupada (cria doc na subcoleção)
  const marcarData = async (date) => {
    if (!freela?.uid) return
    const dia = date.toISOString().split('T')[0]
    const docRef = doc(db, 'usuarios', freela.uid, 'agenda', dia)
    try {
      await setDoc(docRef, { ocupado: true })
      // Atualiza localmente no estado
      setDatasOcupadas(prev => [...prev, dia])
    } catch (error) {
      console.error('Erro ao marcar data:', error)
    }
  }

  // Desmarca uma data (remove o doc na subcoleção)
  const desmarcarData = async (date) => {
    if (!freela?.uid) return
    const dia = date.toISOString().split('T')[0]
    const docRef = doc(db, 'usuarios', freela.uid, 'agenda', dia)
    try {
      await deleteDoc(docRef)
      // Atualiza localmente no estado
      setDatasOcupadas(prev => prev.filter(d => d !== dia))
    } catch (error) {
      console.error('Erro ao desmarcar data:', error)
    }
  }

  // Desabilita o dia clicável no calendário se estiver ocupado (já marcado)
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false
    const dia = date.toISOString().split('T')[0]
    return datasOcupadas.includes(dia)
  }

  if (carregando) {
    return (
      <div className="p-6 bg-white rounded-xl shadow mt-8">
        <p className="text-center text-orange-600">Carregando agenda...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">📆 Minha Agenda</h2>
      <Calendar
        onClickDay={async (date) => {
          const dia = date.toISOString().split('T')[0]
          if (datasOcupadas.includes(dia)) {
            // Confirma se quer liberar a data marcada
            const confirmar = window.confirm('Deseja liberar essa data da agenda?')
            if (confirmar) {
              await desmarcarData(date)
            }
          } else {
            // Marca a data como ocupada
            await marcarData(date)
          }
        }}
        tileDisabled={tileDisabled}
      />
      <p className="text-sm text-gray-500 mt-4 text-center">
        Clique em uma data para marcar como ocupada. Para liberar, clique novamente e confirme.
      </p>
    </div>
  )
}
