import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function AvaliacaoContratante({ chamada }) {
  const { usuario } = useAuth()
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  const enviarAvaliacao = async () => {
    if (!nota || !comentario) return toast.error('Preencha todos os campos')

    try {
      await addDoc(collection(db, 'avaliacoesContratante'), {
        chamadaId: chamada.id,
        freelaUid: usuario.uid,
        contratanteUid: chamada.contratanteUid,
        nota,
        comentario,
        criadoEm: serverTimestamp()
      })
      setEnviado(true)
      toast.success('Avaliação enviada!')
    } catch (e) {
      console.error('Erro ao enviar avaliação:', e)
      toast.error('Erro ao enviar')
    }
  }

  if (enviado) return <p className="text-green-600">✅ Avaliação enviada</p>

  return (
    <div className="mt-2 border rounded p-2">
      <p className="font-semibold">Deixe sua avaliação:</p>
      <div className="flex space-x-2 my-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setNota(n)} className={nota === n ? 'text-yellow-500' : 'text-gray-400'}>
            {n} ⭐
          </button>
        ))}
      </div>
      <textarea
        className="w-full border rounded p-1"
        placeholder="Escreva um comentário..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
      <button onClick={enviarAvaliacao} className="mt-2 bg-blue-600 text-white px-4 py-1 rounded">
        Enviar Avaliação
      </button>
    </div>
  )
}