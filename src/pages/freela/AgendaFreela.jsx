// src/pages/freela/AgendaFreela.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AgendaFreela({ freelaId }) {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarAgenda = async () => {
      try {
        if (!usuario || !usuario.uid || usuario.uid !== freelaId) {
          console.warn('Permissão negada: UID não corresponde ao usuário logado.')
          setEventos([])
          setCarregando(false)
          return
        }

        const agendaRef = collection(db, 'usuarios', freelaId, 'agenda')
        const snapshot = await getDocs(agendaRef)
        const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setEventos(dados)
      } catch (erro) {
        console.error('Erro ao buscar dados:', erro)
        setEventos([])
      } finally {
        setCarregando(false)
      }
    }

    if (freelaId) carregarAgenda()
  }, [freelaId, usuario])

  if (carregando) return <p className="text-center">Carregando agenda...</p>

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold text-orange-600 mb-3">📆 Minha Agenda</h2>
      {eventos.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">Nenhum evento na agenda.</p>
      ) : (
        <ul className="space-y-2">
          {eventos.map((evento) => (
            <li key={evento.id} className="border p-2 rounded shadow-sm">
              <strong>{evento.titulo || 'Evento sem título'}</strong>
              <p className="text-xs text-gray-600">{evento.data || 'Sem data definida'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
