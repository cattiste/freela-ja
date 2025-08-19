
import React, { useState } from 'react'
import { db } from '@/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

export default function AvaliacaoContratante({ chamada, usuario }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  const enviarAvaliacao = async () => {
    if (!nota || !comentario) return toast.error('Preencha todos os campos')
    try {
      await addDoc(collection(db, 'avaliacoesContratantes'), {
        contratanteUid: usuario.uid,
        freelaUid: chamada.freelaUid,
        chamadaId: chamada.id,
        nota,
        comentario,
        criadoEm: serverTimestamp(),
      })
      toast.success('Avaliação enviada!')
      setEnviado(true)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar avaliação')
    }
  }

  if (enviado) return <p className="text-green-600 font-bold mt-2">✅ Avaliação enviada!</p>

  return (
    <div className="mt-4">
      <p className="font-semibold mb-1">Deixe sua avaliação:</p>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setNota(n)} className={\`text-2xl \${nota >= n ? 'text-yellow-400' : 'text-gray-300'}\`}>⭐</button>
        ))}
      </div>
      <textarea
        className="w-full p-2 border rounded mb-2 text-black"
        placeholder="Comentário"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
      <button onClick={enviarAvaliacao} className="bg-blue-600 text-white px-4 py-2 rounded">Enviar Avaliação</button>
    </div>
  )
}
