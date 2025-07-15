// src/pages/gerais/Avaliacao.jsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { auth, db } from '@/firebase'
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'

export default function Avaliacao() {
  const { tipo, id } = useParams() // tipo: "freela" ou "estabelecimento", id: UID do avaliado
  const { usuario } = useAuth()    // usuário logado que está avaliando
  const [avaliado, setAvaliado] = useState(null)
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // busca o documento do avaliado na coleção correta
        const ref = doc(
          db,
          tipo === 'freela' ? 'freelas' : 'estabelecimentos',
          id
        )
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setAvaliado(snap.data())
        }
      } catch (error) {
        console.error('Erro ao buscar dados do avaliado:', error)
      }
    }

    fetchData()
  }, [tipo, id])

  const enviarAvaliacao = async () => {
    try {
      const collectionRef = collection(
        db,
        tipo === 'freela'
          ? 'avaliacoes_freelas'
          : 'avaliacoes_estabelecimentos'
      )
      await addDoc(collectionRef, {
        avaliadoId: id,
        avaliadorId: usuario.uid,
        nota,
        comentario,
        data: serverTimestamp()
      })
      setEnviado(true)
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
    }
  }

  if (!avaliado) {
    return <p className="text-center mt-4 text-gray-500">Carregando dados...</p>
  }

  if (enviado) {
    return (
      <div className="max-w-md mx-auto p-4 bg-green-100 rounded-lg text-green-800 mt-8">
        <p className="font-semibold">Avaliação enviada com sucesso! ✅</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4">
        Avaliar{' '}
        {tipo === 'freela' ? 'Freelancer' : 'Estabelecimento'}:{' '}
        {avaliado.nome}
      </h2>

      <label className="block mb-2 font-semibold">Nota:</label>
      <select
        value={nota}
        onChange={(e) => setNota(parseInt(e.target.value, 10))}
        className="w-full border rounded p-2 mb-4"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} estrela{n > 1 && 's'}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Comentário:</label>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full border rounded p-2 h-24 mb-4"
        placeholder="Escreva seu feedback..."
      />

      <button
        onClick={enviarAvaliacao}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Enviar Avaliação
      </button>
    </div>
  )
}
