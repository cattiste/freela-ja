// AgendasContratadas.jsx refatorado com modelo igual ao freela (data como ID e anotação)

import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore'
import { db } from '@/firebase'

export default function AgendasContratadas({ estabelecimento }) {
  const [datasOcupadas, setDatasOcupadas] = useState({})
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [nota, setNota] = useState('')
  const [modoEdicao, setModoEdicao] = useState(false)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const carregarAgenda = async () => {
      try {
        const ref = collection(db, 'usuarios', estabelecimento.uid, 'agenda')
        const snap = await getDocs(ref)
        const datas = {}
        snap.docs.forEach(doc => {
          datas[doc.id] = doc.data()
        })
        setDatasOcupadas(datas)
      } catch (err) {
        console.error('Erro ao carregar agenda:', err)
      }
    }

    carregarAgenda()
  }, [estabelecimento])

  const handleClickDia = (date) => {
    const dia = date.toISOString().split('T')[0]

    if (datasOcupadas[dia]) {
      const confirmar = window.confirm(
        `A data ${dia} está marcada. Deseja liberar essa data?`
      )
      if (confirmar) liberarData(dia)
    } else {
      setDataSelecionada(dia)
      setNota('')
      setModoEdicao(true)
    }
  }

  const marcarData = async () => {
    if (!dataSelecionada || !estabelecimento?.uid) return

    try {
      const ref = doc(db, 'usuarios', estabelecimento.uid, 'agenda', dataSelecionada)
      await setDoc(ref, { nota: nota.trim() || 'Ocupado' })
      setModoEdicao(false)
      setDataSelecionada(null)
      setNota('')
      setDatasOcupadas(prev => ({
        ...prev,
        [dataSelecionada]: { nota: nota.trim() || 'Ocupado' }
      }))
    } catch (err) {
      console.error('Erro ao marcar data:', err)
      alert('Erro ao marcar data. Veja o console.')
    }
  }

  const liberarData = async (dia) => {
    if (!estabelecimento?.uid) return

    try {
      const ref = doc(db, 'usuarios', estabelecimento.uid, 'agenda', dia)
      await deleteDoc(ref)
      setDatasOcupadas(prev => {
        const novo = { ...prev }
        delete novo[dia]
        return novo
      })
    } catch (err) {
      console.error('Erro ao liberar data:', err)
      alert('Erro ao liberar data. Veja o console.')
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold text-orange-700">📅 Minha Agenda</h2>
      <Calendar
        onClickDay={handleClickDia}
        tileContent={({ date }) => {
          const dia = date.toISOString().split('T')[0]
          if (datasOcupadas[dia]) {
            return (
              <div className="text-xs text-orange-700 font-bold mt-1">
                📌 {datasOcupadas[dia].nota || 'Ocupado'}
              </div>
            )
          }
          return null
        }}
      />

      {modoEdicao && (
        <div className="mt-4 p-4 border rounded bg-yellow-50">
          <p>
            Marcando data: <strong>{dataSelecionada}</strong>
          </p>
          <textarea
            placeholder="Adicione uma nota (opcional)"
            value={nota}
            onChange={e => setNota(e.target.value)}
            className="w-full p-2 border rounded mt-2"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={marcarData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setModoEdicao(false)
                setDataSelecionada(null)
                setNota('')
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Clique em uma data para marcar como ocupada. Para liberar, clique novamente e confirme.
      </p>
    </div>
  )
}
