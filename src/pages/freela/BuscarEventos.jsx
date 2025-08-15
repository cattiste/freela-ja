// src/pages/freela/BuscarEventos.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { toast } from 'react-hot-toast'

export default function BuscarEventos() {
  const [eventos, setEventos] = useState([])
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usuario) => {
      if (usuario) setUsuario(usuario)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'eventos'), where('status', '==', 'pago'))
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEventos(lista)
    })
    return () => unsub()
  }, [])

  const seCandidatar = async (eventoId) => {
    if (!usuario) {
      toast.error('Você precisa estar logado para se candidatar.')
      return
    }
    try {
      const ref = doc(db, 'eventos', eventoId, 'candidatos', usuario.uid)
      await setDoc(ref, {
        uid: usuario.uid,
        nome: usuario.displayName || 'Freela',
        email: usuario.email || '',
        status: 'pendente',
        criadoEm: serverTimestamp()
      }, { merge: true })
      toast.success('Candidatura enviada!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao se candidatar.')
    }
  }

  const fmtValor = (v) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return '—'
    return `R$ ${n.toFixed(2)}`
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Eventos Disponíveis</h1>
      {eventos.length === 0 ? (
        <p className="text-gray-500">Nenhum evento disponível no momento.</p>
      ) : (
        <ul className="space-y-4">
          {eventos.map(evento => (
            <li key={evento.id} className="border p-4 rounded shadow">
              <p><strong>{evento.titulo}</strong></p>
              <p>{evento.descricao}</p>
              <p className="text-sm text-gray-500">Cidade: {evento.cidade}</p>
              <p className="text-sm">Valor: {fmtValor(evento.valor)}</p>
              <button
                onClick={() => seCandidatar(evento.id)}
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Me candidatar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
