import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import '@/styles/calendar.css'
import { db } from '@/firebase'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'

export default function AgendaFreela({ freela }) {
  const { usuario } = useAuth()
  const freelaReal = freela || usuario

  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [datasOcupadas, setDatasOcupadas] = useState({})
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [nota, setNota] = useState('')
  const [modoEdicao, setModoEdicao] = useState(false)

  useEffect(() => {
    if (!freelaReal?.uid) return

    const ref = collection(db, 'usuarios', freelaReal.uid, 'agenda')
    const unsubscribe = onSnapshot(ref, snapshot => {
      const datas = {}
      snapshot.docs.forEach(doc => {
        datas[doc.id] = doc.data()
      })
      setDatasOcupadas(datas)
    })

    return () => unsubscribe()
  }, [freelaReal])

  const handleClickDia = (date) => {
    const dia = date.toISOString().split('T')[0]

    if (datasOcupadas[dia]) {
      const confirm = window.confirm(
        `A data ${dia} está marcada como ocupada. Deseja liberar essa data?`
      )
      if (confirm) {
        liberarData(dia)
      }
    } else {
      setDataSelecionada(dia)
      setNota('')
      setModoEdicao(true)
    }
  }

  const marcarData = async () => {
    if (!dataSelecionada || !freelaReal?.uid) {
      alert('Usuário não definido ou data inválida.')
      return
    }

    try {
      const ref = doc(db, 'usuarios', freelaReal.uid, 'agenda', dataSelecionada)
      await setDoc(ref, { ocupado: true, nota: nota.trim() || null })
      setModoEdicao(false)
      setDataSelecionada(null)
      setNota('')
    } catch (err) {
      alert('Erro ao marcar data. Veja o console.')
      console.error(err)
    }
  }

  const liberarData = async (dia) => {
    if (!freelaReal?.uid) return
    try {
      const ref = doc(db, 'usuarios', freelaReal.uid, 'agenda', dia)
      await deleteDoc(ref)
    } catch (err) {
      alert('Erro ao liberar data. Veja o console.')
      console.error(err)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">📆 Minha Agenda</h2>
      <Calendar
        onClickDay={handleClickDia}
        tileContent={({ date }) => {
          const dia = date.toISOString().split('T')[0]
          if (datasOcupadas[dia]) {
            return (
              <div className="text-xs text-red-600 font-bold mt-1">
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

      <p className="text-sm text-gray-500 mt-4">
        Clique em uma data para marcar como ocupada. Para liberar uma data ocupada, clique nela e confirme.
      </p>
    </div>
  )
}
