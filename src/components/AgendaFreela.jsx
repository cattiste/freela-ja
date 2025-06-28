import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-toastify'

export default function AgendaFreela({ uid }) {
  const [datasOcupadas, setDatasOcupadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const carregarAgenda = async () => {
      setLoading(true)
      try {
        const docRef = doc(db, 'agendas', uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setDatasOcupadas(snap.data().ocupado || [])
        } else {
          setDatasOcupadas([])
        }
      } catch (err) {
        toast.error('Erro ao carregar agenda.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (uid) carregarAgenda()
  }, [uid])

  const toggleData = async (date) => {
    const iso = date.toISOString().split('T')[0]
    const nova = datasOcupadas.includes(iso)
      ? datasOcupadas.filter(d => d !== iso)
      : [...datasOcupadas, iso]

    setDatasOcupadas(nova)
    setSalvando(true)

    try {
      await setDoc(doc(db, 'agendas', uid), { ocupado: nova })
      toast.success('Agenda salva.')
    } catch (err) {
      toast.error('Erro ao salvar agenda.')
      console.error(err)
      // opcional: reverter estado em caso de erro
      // setDatasOcupadas(prev => prev)
    } finally {
      setSalvando(false)
    }
  }

  const tileClassName = ({ date, view }) => {
    const iso = date.toISOString().split('T')[0]
    if (view === 'month' && datasOcupadas.includes(iso)) {
      return 'bg-red-200'
    }
    return null
  }

  if (loading) {
    return <p className="text-gray-600">Carregando agenda...</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-blue-700 mb-4">📅 Agenda de Disponibilidade</h2>
      <p className="text-gray-600 mb-2 text-sm">Clique nos dias para marcar como ocupado/disponível.</p>
      <Calendar
        onClickDay={toggleData}
        tileClassName={tileClassName}
        className="border rounded-lg"
      />
      {salvando && (
        <p className="mt-2 text-sm text-blue-600">Salvando...</p>
      )}
    </div>
  )
}
