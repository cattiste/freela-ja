// src/pages/freela/AgendaFreela.jsx
import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import '@/styles/calendar.css'
import { db } from '@/firebase'
+import { collection, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore'

export default function AgendaFreela({ freela }) {
  const [datasOcupadas, setDatasOcupadas] = useState({})
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [nota, setNota] = useState('')
  const [modoEdicao, setModoEdicao] = useState(false)

  useEffect(() => {
    if (!freela?.uid) return
    const ref = collection(db, 'usuarios', freela.uid, 'agenda')
    const unsub = onSnapshot(ref, snapshot => {
      const datas = {}
      snapshot.docs.forEach(d => { datas[d.id] = d.data() })
      setDatasOcupadas(datas)
    })
    return () => unsub()
  }, [freela.uid])

  const handleClickDia = date => {
    const dia = date.toISOString().split('T')[0]
    if (datasOcupadas[dia]) {
      const conf = window.confirm(`Liberar ${dia}?`)
      if (conf) deleteDoc(doc(db, 'usuarios', freela.uid, 'agenda', dia))
    } else {
      setDataSelecionada(dia)
      setNota('')
      setModoEdicao(true)
    }
  }

  const marcarData = async () => {
    if (!dataSelecionada) return
    await setDoc(doc(db, 'usuarios', freela.uid, 'agenda', dataSelecionada), {
      ocupado: true,
      nota: nota.trim() || null
    })
    setModoEdicao(false)
    setDataSelecionada(null)
    setNota('')
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold text-blue-700">📆 Minha Agenda</h2>
      <Calendar
        onClickDay={handleClickDia}
        tileContent={({ date }) => {
          const dia = date.toISOString().split('T')[0]
          if (datasOcupadas[dia]) {
            return <div className="text-xs text-red-600">📌 {datasOcupadas[dia].nota || 'Ocupado'}</div>
          }
          return null
        }}
      />
      {modoEdicao && (
        <div className="p-4 border rounded bg-yellow-50 space-y-2">
          <p>Marcando: <strong>{dataSelecionada}</strong></p>
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Nota (opcional)"
            className="w-full border rounded p-2"
            rows={3}
          />
          <div className="flex gap-2">
            <button onClick={marcarData} className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
            <button onClick={() => setModoEdicao(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
