// src/pages/freela/EventosDisponiveis.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function EventosDisponiveis({ freela }) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [candidaturas, setCandidaturas] = useState([])

  if (!freela?.uid) {
    return <p className="text-center text-red-600 mt-10">⚠️ Faça login novamente.</p>
  }

  useEffect(() => {
    async function fetchEventos() {
      setLoading(true)
      setErro(null)
      try {
        const q = query(
          collection(db, 'vagas'),
          where('status', '==', 'aberta'),
          where('tipo', '==', 'freela')
        )
        const snap = await getDocs(q)
        setEventos(snap.docs.map(d => ({ id: d.id, ...d.data() })))

        const qCand = query(
          collection(db, 'candidaturas'),
          where('freelaUid', '==', freela.uid)
        )
        const snapCand = await getDocs(qCand)
        setCandidaturas(snapCand.docs.map(c => ({ id: c.id, ...c.data() })))
      } catch (err) {
        console.error(err)
        setErro('Erro ao carregar eventos.')
      } finally {
        setLoading(false)
      }
    }
    fetchEventos()
  }, [freela.uid])

  const handleCandidatar = async evento => {
    try {
      // Registrar candidatura
      await addDoc(collection(db, 'candidaturas'), {
        vagaId: evento.id,
        estabelecimentoUid: evento.estabelecimentoUid,
        freelaUid: freela.uid,
        dataCandidatura: serverTimestamp(),
        status: 'pendente'
      })
      // Marcar datas do evento na agenda do freela
      evento.datas.forEach(async dt => {
        const iso = dt.toDate ? dt.toDate().toISOString().split('T')[0] : ''
        await setDoc(
          doc(db, 'usuarios', freela.uid, 'agenda', iso),
          { ocupado: true, nota: evento.titulo }
        )
      })
      setCandidaturas(prev => [...prev, { vagaId: evento.id }])
    } catch (err) {
      console.error(err)
      setErro('Falha ao se candidatar no evento.')
    }
  }

  if (loading) return <p className="text-center text-orange-600">Carregando eventos...</p>
  if (erro) return <p className="text-center text-red-600">{erro}</p>

  return (
    <div className="space-y-6">
      {eventos.map(ev => (
        <div key={ev.id} className="p-4 border rounded shadow-sm">
          <h3 className="font-bold text-orange-700 mb-1">{ev.titulo}</h3>
          <p><strong>Datas:</strong> {ev.datas.map(d => d.toDate().toLocaleDateString('pt-BR')).join(', ')}</p>
          <button
            onClick={() => handleCandidatar(ev)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >Participar</button>
        </div>
      ))}
    </div>
  )
}
