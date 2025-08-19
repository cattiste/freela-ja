import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function CardAvaliacaoFreela({ chamada, usuario }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviada, setEnviada] = useState(!!chamada.avaliacaoFreela)
  const [enviando, setEnviando] = useState(false)

  const enviarAvaliacao = async () => {
    if (nota === 0 || comentario.trim() === '') {
      toast.error('Preencha todos os campos antes de enviar.')
      return
    }
    if (!chamada?.freelaUid || !usuario?.uid) {
      toast.error('Dados incompletos para avaliação.')
      return
    }

    setEnviando(true)
    try {
      await addDoc(collection(db, 'avaliacoesFreelas'), {
        freelaUid: chamada.freelaUid,
        contratanteUid: usuario.uid,
        nota,
        comentario,
        criadoEm: serverTimestamp(),
      })

      toast.success('Avaliação enviada com sucesso!')
      setEnviada(true)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviada || chamada.avaliacaoFreela) {
    return <div className="text-green-600 font-medium p-2">✅ Avaliação enviada</div>
  }

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
        disabled={enviando}
        className="bg-blue-600 text-white px-4 py-1 mt-2 rounded"
      >
        Enviar Avaliação
      </button>
    </div>
  )
}
