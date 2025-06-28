import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
<<<<<<< HEAD
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
=======
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-toastify'
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

export default function AgendaFreela({ uid }) {
  const [datasOcupadas, setDatasOcupadas] = useState([])
  const [loading, setLoading] = useState(true)
<<<<<<< HEAD
  const [error, setError] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function carregarAgenda() {
      setLoading(true)
      setError(null)
      try {
        const docRef = doc(db, 'agendas', uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setDatasOcupadas(docSnap.data().ocupado || [])
        } else {
          setDatasOcupadas([])
        }
      } catch (error) {
        console.error('Erro ao carregar agenda:', error)
        setError('Erro ao carregar agenda.')
=======
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
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      } finally {
        setLoading(false)
      }
    }
<<<<<<< HEAD

    if (uid) {
      carregarAgenda()
    }
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
    } catch (error) {
      console.error('Erro ao salvar agenda:', error)
      setError('Erro ao salvar agenda.')
      // Reverter estado se quiser
      setDatasOcupadas(datasOcupadas)
=======
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
      // Se quiser, reverte:
      // setDatasOcupadas(prev => prev)
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    } finally {
      setSalvando(false)
    }
  }

<<<<<<< HEAD
  const tileClassName = ({ date }) => {
    const dataISO = date.toISOString().split('T')[0]
    return datasOcupadas.includes(dataISO) ? 'bg-red-200' : ''
  }

  if (loading) {
    return <p>Carregando agenda...</p>
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-blue-700 mb-4">📅 Agenda de Disponibilidade</h2>
      <p className="text-gray-600 mb-2 text-sm">Clique nos dias para marcar como ocupado ou disponível.</p>
      <Calendar
        onClickDay={toggleData}
        tileClassName={tileClassName}
      />
      {salvando && <p className="text-sm text-gray-500 mt-2">Salvando alterações...</p>}
=======
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
    <div>
      <p className="text-gray-600 mb-2 text-sm">
        📅 Clique nos dias para marcar como ocupado/disponível.
      </p>
      <Calendar
        onClickDay={toggleData}
        tileClassName={tileClassName}
        className="border rounded-lg"
      />
      {salvando && (
        <p className="mt-2 text-sm text-blue-600">Salvando...</p>
      )}
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    </div>
  )
}
