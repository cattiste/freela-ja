import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function CardAvaliacaoFreela({ chamada, usuario }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviada, setEnviada] = useState(chamada.avaliacaoFreela !== undefined)

  const enviarAvaliacao = async () => {
    if (nota === 0 || comentario.trim() === '') {
      toast.error('Preencha todos os campos antes de enviar.')
      return
    }

    try {
      await addDoc(collection(db, 'avaliacoesFreelas'), {
        freelaUid: chamada.freelaUid,
        contratanteUid: usuario.uid,
        nota,
        comentario,
        criadoEm: serverTimestamp(),
      })

      setEnviada(true)
      toast.success('Avaliação enviada com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar avaliação.')
    }
  }

  if (enviada) return null

  return (
    <div className="p-2">
      <p className="font-medium">Deixe sua avaliação:</p>
      <div className="flex gap-2 my-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setNota(n)}
            className={`text-xl ${nota >= n ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ⭐
          </button>
        ))}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full border rounded p-1"
        placeholder="Escreva um comentário..."
      />
      <button
        onClick={enviarAvaliacao}
        className="bg-blue-600 text-white px-4 py-1 mt-2 rounded"
      >
        Enviar Avaliação
      </button>
    </div>
  )
}
