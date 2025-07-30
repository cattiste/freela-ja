import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

export default function AgendasContratadas({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [compromissos, setCompromissos] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [novoCompromisso, setNovoCompromisso] = useState('')
  const [carregando, setCarregando] = useState(true)

  const dataStr = dataSelecionada.toDateString()

  // Carrega chamadas do sistema (vagas e eventos)
  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const lista = []

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        data.id = docSnap.id
        data.dataStr = data.data?.toDate().toDateString()
        lista.push(data)
      }

      setChamadas(lista)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  // Carrega compromissos manuais
  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'usuarios', estabelecimento.uid, 'compromissos')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataStr: doc.data().data?.toDate().toDateString()
      }))
      setCompromissos(lista)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  const todasDatas = [
    ...chamadas.map(c => c.dataStr),
    ...compromissos.map(c => c.dataStr)
  ]

  const compromissosDoDia = [
    ...chamadas.filter(c => c.dataStr === dataStr),
    ...compromissos.filter(c => c.dataStr === dataStr)
  ]

  const salvarCompromisso = async () => {
    if (!novoCompromisso.trim()) return
    const ref = collection(db, 'usuarios', estabelecimento.uid, 'compromissos')

    await addDoc(ref, {
      titulo: novoCompromisso,
      data: Timestamp.fromDate(dataSelecionada),
      criadoEm: Timestamp.now()
    })

    setNovoCompromisso('')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
        <h3 className="text-lg font-bold text-orange-700 mb-2">Minha Agenda</h3>

        <Calendar
          value={dataSelecionada}
          onChange={setDataSelecionada}
          tileClassName={({ date }) =>
            todasDatas.includes(date.toDateString())
              ? 'bg-orange-200 text-black font-bold rounded-lg'
              : null
          }
          tileContent={({ date }) =>
            todasDatas.includes(date.toDateString()) ? (
              <div className="dot-indicator" />
            ) : null
          }
        />

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-orange-700">
            Adicionar compromisso em {dataSelecionada.toLocaleDateString()}
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Ex: reunião, lembrete, entrevista..."
              value={novoCompromisso}
              onChange={(e) => setNovoCompromisso(e.target.value)}
            />
            <button
              onClick={salvarCompromisso}
              className="bg-orange-600 text-white text-sm px-3 py-1 rounded hover:bg-orange-700"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
        <h3 className="text-lg font-bold text-orange-700 mb-2">
          Compromissos em {dataSelecionada.toLocaleDateString()}
        </h3>
        {carregando ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : compromissosDoDia.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum compromisso marcado para este dia.</p>
        ) : (
          <ul className="text-sm list-disc list-inside space-y-1">
            {compromissosDoDia.map((item) => (
              <li key={item.id}>{item.titulo || item.vagaTitulo || 'Evento'}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
