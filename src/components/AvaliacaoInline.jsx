import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function AvaliacaoInline({ chamada, usuario, tipo }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviada, setEnviada] = useState(
    tipo === 'freela' ? !!chamada.avaliacaoFreela : !!chamada.avaliacaoContratante
  )

  const enviarAvaliacao = async () => {
    if (nota === 0 || comentario.trim() === '') {
      toast.error('Preencha todos os campos.')
      return
    }

    try {
      const dados = {
        nota,
        comentario,
        criadoEm: serverTimestamp(),
      }

      if (tipo === 'freela') {
        dados.freelaUid = chamada.freelaUid
        dados.contratanteUid = usuario.uid
        await addDoc(collection(db, 'avaliacoesFreelas'), dados)
      } else {
        dados.freelaUid = usuario.uid
        dados.contratanteUid = chamada.estabelecimentoUid
        await addDoc(collection(db, 'avaliacoesContratantes'), dados)
      }

      toast.success('Avaliação enviada!')
      setEnviada(true)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar.')
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
