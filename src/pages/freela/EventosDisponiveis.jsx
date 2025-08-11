import React, { useEffect, useState } from 'react'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore'

export default function EventosDisponiveis({ freela }) {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const eventosRef = collection(db, 'eventos')
        const qEventos = query(eventosRef, where('ativo', '==', true))
        const snapshotEventos = await getDocs(qEventos)
        const listaEventos = snapshotEventos.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        setEventos(listaEventos)

        const uid = freela?.uid || usuario?.uid

        if (uid) {
          const candidaturasRef = collection(db, 'candidaturasEventos')
          const qCandidaturas = query(
            candidaturasRef,
            where('freelaUid', '==', uid)
          )
          const snapshotCandidaturas = await getDocs(qCandidaturas)
          const eventosCandidatados = snapshotCandidaturas.docs.map(doc => doc.data().eventoId)
          setCandidaturas(eventosCandidatados)
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setCarregando(false)
      }
    }

    buscarDados()
  }, [freela, usuario])

  const candidatar = async (evento) => {
    const uid = freela?.uid || usuario?.uid
    if (!uid) return alert("Usuário não autenticado.")

    try {
      const ref = collection(db, 'candidaturasEventos')
      await addDoc(ref, {
        eventoId: evento.id,
        freelaUid: uid,
        dataCandidatura: Timestamp.now(),
        status: 'pendente',
      })
      alert('Candidatura enviada com sucesso!')
      setCandidaturas(prev => [...prev, evento.id])
    } catch (err) {
      console.error('Erro ao candidatar-se:', err)
    }
  }

  if (carregando) return <p className="text-center text-orange-600 mt-10">🔄 Carregando eventos...</p>
  if (!freela?.uid && !usuario?.uid) {
    return (
      <p className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </p>
    )
  }

  return (
    <div className="max-w-full p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">🎉 Eventos Disponíveis</h2>
      {eventos.length === 0 ? (
        <p className="text-center">Nenhum evento disponível no momento.</p>
      ) : (
        eventos.map(evento => {
          const jaCandidatado = candidaturas.includes(evento.id)
          return (
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
                disabled={jaCandidatado}
                className={`mt-3 px-4 py-1.5 rounded ${
                  jaCandidatado
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {jaCandidatado ? 'Já Candidatado' : '📩 Candidatar-se'}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
