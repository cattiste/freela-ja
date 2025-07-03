import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/styles/Calendar.css'
import { db } from '@/firebase'
import {
  doc,
  setDoc,
  collection,
  deleteDoc,
  onSnapshot,
  getDoc
} from 'firebase/firestore'

export default function AgendaFreela({ freela }) {
  const [datasOcupadas, setDatasOcupadas] = useState({}) // { '2025-07-10': { ocupado: true, descricao: '...' }, ... }
  const [dataSelecionada, setDataSelecionada] = useState(null) // data clicada para editar
  const [descricao, setDescricao] = useState('')
  const [editavel, setEditavel] = useState(true) // se data bloqueada ou não

  useEffect(() => {
    if (!freela?.uid) return

    const ref = collection(db, 'usuarios', freela.uid, 'agenda')

    const unsubscribe = onSnapshot(ref, snapshot => {
      const datas = {}
      snapshot.docs.forEach(doc => {
        datas[doc.id] = doc.data()
      })
      setDatasOcupadas(datas)
    })

    return () => unsubscribe()
  }, [freela])

  // abrir modal para editar a data clicada
  const abrirEdicao = (date) => {
    const dia = date.toISOString().split('T')[0]
    setDataSelecionada(dia)

    // carrega descrição atual
    if (datasOcupadas[dia]) {
      setDescricao(datasOcupadas[dia].descricao || '')
      // Bloqueia edição se a data estiver "travada" (exemplo: se houver evento futuro, adaptar depois)
      // Por ora, vamos liberar edição, pode ajustar conforme evento real
      setEditavel(!datasOcupadas[dia].travada) 
    } else {
      setDescricao('')
      setEditavel(true)
    }
  }

  // salvar a descrição e marcar ocupado
  const salvarDescricao = async () => {
    if (!dataSelecionada) return
    const ref = doc(db, 'usuarios', freela.uid, 'agenda', dataSelecionada)
    if (descricao.trim() === '') {
      // Se descrição vazia, remove o registro
      await deleteDoc(ref)
    } else {
      await setDoc(ref, { ocupado: true, descricao: descricao.trim() })
    }
    setDataSelecionada(null)
    setDescricao('')
  }

  // cancelar edição
  const cancelarEdicao = () => {
    setDataSelecionada(null)
    setDescricao('')
  }

  const tileClassName = ({ date }) => {
    const dia = date.toISOString().split('T')[0]
    if (datasOcupadas[dia]) {
      return 'bg-red-200 text-red-800 font-bold cursor-pointer'
    }
    return ''
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">📆 Minha Agenda</h2>
      <Calendar
        onClickDay={abrirEdicao}
        tileClassName={tileClassName}
      />

      <p className="text-sm text-gray-500 mt-4">
        Clique em uma data para adicionar ou editar a descrição. Deixe em branco para liberar a data.
      </p>

      {/* Modal simples */}
      {dataSelecionada && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Editar {dataSelecionada}</h3>
            {editavel ? (
              <>
                <textarea
                  rows={4}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Digite uma descrição para esta data (ex: Evento, Férias, Indisponível)"
                  className="w-full border border-gray-300 rounded p-2 mb-4"
                />
                <div className="flex justify-end gap-4">
                  <button
                    onClick={cancelarEdicao}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarDescricao}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-red-600 font-semibold">
                  Esta data está bloqueada devido a um evento já aceito.
                </p>
                <button
                  onClick={cancelarEdicao}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
