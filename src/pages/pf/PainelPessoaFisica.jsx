import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import FormEventoPessoaFisica from './FormEventoPessoaFisica'

export default function PainelPessoaFisica() {
  const [usuario, setUsuario] = useState(null)
  const [eventos, setEventos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login')
      } else {
        setUsuario(user)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!usuario) return

    const q = query(collection(db, 'eventos'), where('uidCriador', '==', usuario.uid))
    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEventos(lista)
    })

    return () => unsubscribe()
  }, [usuario])

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-6 text-center">Painel da Pessoa Física</h1>

      <FormEventoPessoaFisica />

      <h2 className="text-xl font-semibold mt-10 mb-4 text-gray-800">Seus eventos publicados:</h2>
      {eventos.length === 0 ? (
        <p className="text-gray-500">Nenhum evento cadastrado ainda.</p>
      ) : (
        <ul className="space-y-4">
          {eventos.map((evento) => (
            <li key={evento.id} className="border p-4 rounded shadow bg-white">
              <p><strong>{evento.titulo}</strong></p>
              <p>{evento.descricao}</p>
              <p className="text-sm text-gray-600">Data: {new Date(evento.dataEvento).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Status: {evento.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
