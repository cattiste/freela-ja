// src/pages/freela/EventosDisponiveis.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function EventosDisponiveis({ freela }) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!freela?.uid) return

    async function fetchEventosFreela() {
      setLoading(true)
      setErro(null)
      try {
        // Busca só eventos Freela (diárias)
        const q = query(
          collection(db, 'vagas'),
          where('status', '==', 'aberta'),
          where('tipo', '==', 'freela')
        )
        const snap = await getDocs(q)
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setEventos(list)
      } catch (err) {
        console.error('[EventosDisponiveis]', err)
        setErro('Erro ao carregar eventos.')
      } finally {
        setLoading(false)
      }
    }

    fetchEventosFreela()
  }, [freela.uid])

  if (loading) return <p className="text-center text-orange-600">Carregando eventos...</p>
  if (erro)    return <p className="text-center text-red-600">{erro}</p>
  if (eventos.length === 0)
    return <p className="text-center text-gray-600">Nenhum evento Freela disponível.</p>

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-600">
           Eventos Disponiveis
        </h2>
      </div>
    
    <div className="space-y-6">
      {eventos.map(ev => (
        <div key={ev.id} className="p-4 border rounded shadow-sm bg-white">
          <h3 className="font-bold text-orange-700 mb-1">{ev.titulo}</h3>
          <p><strong>Datas:</strong> {ev.datas.map(d => d.toDate().toLocaleDateString('pt-BR')).join(', ')}</p>
          <button
            onClick={async () => {
              try {
                // Cria candidatura
                await addDoc(collection(db, 'candidaturas'), {
                  vagaId: ev.id,
                  estabelecimentoUid: ev.estabelecimentoUid,
                  freelaUid: freela.uid,
                  dataCandidatura: serverTimestamp(),
                  status: 'pendente'
                })
                // Marca cada data na agenda
                ev.datas.forEach(async dt => {
                  const iso = dt.toDate().toISOString().split('T')[0]
                  await setDoc(
                    doc(db, 'usuarios', freela.uid, 'agenda', iso),
                    { ocupado: true, nota: ev.titulo }
                  )
                })
                toast.success('Inscrição no evento confirmada!')
              } catch (e) {
                console.error(e)
                toast.error('Falha ao participar do evento.')
              }
            }}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Participar
          </button>
        </div>
      ))}
    </div>
  )
}
