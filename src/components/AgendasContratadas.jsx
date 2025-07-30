import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

export default function AgendasContratadas({ estabelecimento }) {
  const [todasChamadas, setTodasChamadas] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [datasAgendadas, setDatasAgendadas] = useState([])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chamadas = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const chamada = { id: docSnap.id, ...docSnap.data() }

        const freelaSnap = await getDoc(doc(db, 'usuarios', chamada.freelaUid))
        chamada.freela = freelaSnap.exists() ? freelaSnap.data() : {}

        return chamada
      }))

      const datas = chamadas
        .filter((c) => c.data)
        .map((c) => c.data.toDate().toDateString())

      setTodasChamadas(chamadas)
      setDatasAgendadas([...new Set(datas)])
    })

    return () => unsubscribe()
  }, [estabelecimento])

  const tileClassName = ({ date }) => {
    if (datasAgendadas.includes(date.toDateString())) {
      return 'bg-orange-200 text-black font-bold rounded-lg'
    }
    return null
  }

  const tileContent = ({ date }) =>
    datasAgendadas.includes(date.toDateString()) ? (
      <div className="dot-indicator" />
    ) : null

  const chamadasDoDia = todasChamadas.filter((chamada) =>
    chamada.data?.toDate().toDateString() === dataSelecionada.toDateString()
  )

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
        <h3 className="text-lg font-bold text-orange-700 mb-2">Minha Agenda</h3>
        <Calendar
          value={dataSelecionada}
          onChange={setDataSelecionada}
          tileClassName={tileClassName}
          tileContent={tileContent}
        />
        <p className="text-xs text-gray-500 mt-2">
          Selecione uma data para ver os compromissos agendados.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
        <h3 className="text-lg font-bold text-orange-700 mb-3">
          Compromissos em {dataSelecionada.toLocaleDateString()}
        </h3>

        {chamadasDoDia.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum compromisso marcado neste dia.</p>
        ) : (
          chamadasDoDia.map((chamada) => (
            <div
              key={chamada.id}
              className="bg-orange-50 border border-orange-200 p-3 rounded mb-2"
            >
              <p><strong>Freela:</strong> {chamada.freela?.nome || '—'}</p>
              <p><strong>Função:</strong> {chamada.freela?.funcao || '—'}</p>
              <p><strong>Vaga:</strong> {chamada.vagaTitulo || '—'}</p>
              <p><strong>Status:</strong> {chamada.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
