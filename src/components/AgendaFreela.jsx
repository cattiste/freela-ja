import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'

export default function AgendaFreela({ uid }) {
  const [datasOcupadas, setDatasOcupadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function carregarAgenda() {
      setLoading(true)
      try {
        const docRef = doc(db, 'agendas', uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setDatasOcupadas(docSnap.data().ocupado || [])
        } else {
          setDatasOcupadas([])
        }
      } catch {
        toast.error('Erro ao carregar agenda.')
      } finally {
        setLoading(false)
      }
    }

    if (uid) carregarAgenda()
  }, [uid])

  const toggleData = async (date) => {
    const dataISO = date.toISOString().split('T')[0]

    const novaAgenda = datasOcupadas.includes(dataISO)
      ? datasOcupadas.filter(d => d !== dataISO)
      : [...datasOcupadas, dataISO]

    setDatasOcupadas(novaAgenda)
    setSalvando(true)

    try {
      await setDoc(doc(db, 'agendas', uid), { ocupado: novaAgenda })
      toast.success('Agenda atualizada com sucesso!')
    } catch {
      toast.error('Erro ao salvar agenda.')
      setDatasOcupadas(datasOcupadas) // Reverte alteração
    } finally {
      setSalvando(false)
    }
  }

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dataISO = date.toISOString().split('T')[0]
      return datasOcupadas.includes(dataISO) ? 'dia-ocupado' : null
    }
  }

  if (!uid) return <p className="text-red-600">ID do usuário não disponível.</p>
  if (loading) return <p>Carregando agenda...</p>

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-blue-700 mb-4">📅 Agenda de Disponibilidade</h2>
      <p className="text-gray-600 mb-2 text-sm">Clique nos dias para marcar como ocupado ou disponível.</p>
      <Calendar
        onClickDay={toggleData}
        tileClassName={tileClassName}
      />
      {salvando && <p className="text-sm text-gray-500 mt-2">Salvando alterações...</p>}
    </div>
  )
}
