import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function PainelPessoaFisica() {
  const [eventos, setEventos] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login')
      } else {
        setUsuario(user)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(collection(db, 'eventos'), where('uidCriador', '==', usuario.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const lista = []
      for (const docSnap of snap.docs) {
        const eventoData = { id: docSnap.id, ...docSnap.data(), candidatos: [] }

        // Buscar candidatos do evento
        const candSnap = await getDocs(collection(db, 'eventos', docSnap.id, 'candidatos'))
        candSnap.forEach(c => {
          eventoData.candidatos.push({ id: c.id, ...c.data() })
        })

        lista.push(eventoData)
      }

      setEventos(lista)
      setLoading(false)
    })

    return () => unsub()
  }, [usuario])

  const aceitarCandidato = async (eventoId, freela) => {
    try {
      const ref = doc(db, 'eventos', eventoId)
      await updateDoc(ref, {
        status: 'aceito',
        freelaEscolhido: {
          uid: freela.id,
          nome: freela.nome,
          email: freela.email
        }
      })
      toast.success(`Freela ${freela.nome} aceito!`)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao aceitar freela.')
    }
  }

  if (loading) return <p className="text-center mt-10">Carregando seus eventos...</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4 text-center">Meus Eventos</h1>

      {eventos.length === 0 ? (
        <p className="text-center text-gray-500">Você ainda não publicou nenhum evento.</p>
      ) : (
        eventos.map(evento => (
          <div key={evento.id} className="mb-6 border rounded p-4 shadow">
            <h2 className="text-lg font-bold text-orange-600">{evento.titulo}</h2>
            <p className="text-sm text-gray-600">{evento.descricao}</p>
            <p className="text-sm">📅 {new Date(evento.dataEvento).toLocaleDateString()}</p>
            <p className="text-sm">📍 {evento.cidade}</p>
            <p className="text-sm mb-2"><strong>Status:</strong> {evento.status}</p>

            {evento.status === 'pago' && evento.candidatos.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold text-gray-700 mb-1">Candidatos:</p>
                <ul className="space-y-2">
                  {evento.candidatos.map(freela => (
                    <li key={freela.id} className="flex justify-between items-center bg-gray-50 border p-2 rounded">
                      <div>
                        <p className="font-medium">{freela.nome}</p>
                        <p className="text-sm text-gray-500">{freela.email}</p>
                      </div>
                      <button
                        onClick={() => aceitarCandidato(evento.id, freela)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Aceitar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evento.status === 'pago' && evento.candidatos.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Nenhum candidato ainda.</p>
            )}

            {evento.status === 'aceito' && evento.freelaEscolhido && (
              <div className="mt-3 bg-green-50 p-2 rounded border border-green-200">
                <p className="text-green-800 text-sm font-medium">Freela escolhido:</p>
                <p className="text-sm">{evento.freelaEscolhido.nome} – {evento.freelaEscolhido.email}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
