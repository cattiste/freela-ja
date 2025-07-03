import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function EventosDisponiveis({ freela }) {
  const [eventos, setEventos] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarEventos = async () => {
      try {
        const eventosRef = collection(db, 'eventos')
        const q = query(eventosRef, where('ativo', '==', true))
        const snapshot = await getDocs(q)

        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setEventos(lista)
      } catch (err) {
        console.error('Erro ao buscar eventos:', err)
      } finally {
        setCarregando(false)
      }
    }

    buscarEventos()
  }, [])

  const candidatar = async (evento) => {
    try {
      const ref = collection(db, 'candidaturasEventos')
      await addDoc(ref, {
        eventoId: evento.id,
        freelaUid: freela.uid,
        dataCandidatura: Timestamp.now(),
        status: 'pendente'
      })
      alert('Candidatura enviada com sucesso!')
      setCandidaturas(prev => [...prev, evento.id])
    } catch (err) {
      console.error('Erro ao candidatar-se:', err)
    }
  }

  if (carregando) return <p>🔄 Carregando eventos...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">🎉 Eventos Disponíveis</h2>
      {eventos.length === 0 ? (
        <p>Nenhum evento disponível no momento.</p>
      ) : (
        eventos.map(evento => (
          <div
            key={evento.id}
            className="border border-gray-300 p-4 rounded-xl bg-white mb-4 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-800">{evento.nome}</h3>
            <p className="text-gray-600 text-sm mt-1">{evento.descricao}</p>
            <p className="text-sm mt-2 text-gray-500">
              📍 <strong>Local:</strong> {evento.local}
              <br />
              📅 <strong>Data:</strong>{' '}
              {evento.data?.toDate ? evento.data.toDate().toLocaleDateString() : 'Data não definida'}
            </p>
            <button
              onClick={() => candidatar(evento)}
              disabled={candidaturas.includes(evento.id)}
              className={`mt-3 px-4 py-1.5 rounded ${
                candidaturas.includes(evento.id)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {candidaturas.includes(evento.id) ? 'Já Candidatado' : '📩 Candidatar-se'}
            </button>
          </div>
        ))
      )}
    </div>
  )
}
