import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function CandidaturasPF() {
  const { usuario } = useAuth()
  const [candidaturas, setCandidaturas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'candidaturasEventos'),
      where('estabelecimentoUid', '==', usuario.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setCandidaturas(lista)
    })

    return () => unsub()
  }, [usuario])

  const aceitarCandidato = async (candidatura) => {
    try {
      await updateDoc(doc(db, 'candidaturasEventos', candidatura.id), {
        status: 'aceita'
      })
      toast.success('Freela aceito com sucesso!')
    } catch (err) {
      toast.error('Erro ao aceitar freela')
    }
  }

  const recusarCandidato = async (candidatura) => {
    try {
      await updateDoc(doc(db, 'candidaturasEventos', candidatura.id), {
        status: 'recusada'
      })
      toast.success('Candidatura recusada')
    } catch (err) {
      toast.error('Erro ao recusar candidatura')
    }
  }

  if (!candidaturas.length) {
    return <div className="text-center text-gray-500 mt-6">Nenhuma candidatura recebida ainda.</div>
  }

  return (
    <div className="space-y-4">
      {candidaturas.map((item) => (
        <div key={item.id} className="bg-white rounded-xl p-4 shadow border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-orange-600 font-bold">{item.freelaNome || 'Freela'}</h3>
              <p className="text-sm text-gray-600">Evento: {item.eventoTitulo}</p>
              <p className="text-sm text-gray-600">Status: <span className="font-semibold">{item.status || 'pendente'}</span></p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => aceitarCandidato(item)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Aceitar
              </button>
              <button
                onClick={() => recusarCandidato(item)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
