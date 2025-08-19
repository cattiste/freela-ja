import React, { useState } from 'react'
import { db } from '@/firebase'
import { updateDoc, doc, serverTimestamp, addDoc, collection } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

export default function AvaliacaoInline({ chamada, tipo }) {
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviarAvaliacao = async () => {
    if (!comentario.trim()) return toast.error('Digite um comentário.')
    setEnviando(true)
    try {
      const chamadaRef = doc(db, 'chamadas', chamada.id)
      const campo = tipo === 'freela' ? 'avaliacaoFreela' : 'avaliacaoContratante'
      const payload = {
        nota,
        comentario,
        criadoEm: serverTimestamp(),
      }
      await updateDoc(chamadaRef, {
        [campo]: payload,
      })

      // Novo: salvar em colecao separada
      const avaliacaoExtra = {
        nota,
        comentario,
        criadoEm: serverTimestamp(),
        chamadaId: chamada.id,
        tipo,
        freelaUid: chamada.freelaUid,
        contratanteUid: chamada.estabelecimentoUid,
      }
      await addDoc(collection(db, 'avaliacoesFreelas'), avaliacaoExtra)

      toast.success('Avaliação enviada!')
      setComentario('')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao enviar avaliação')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border mt-4">
      <p className="font-semibold mb-2">Deixe sua avaliação:</p>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`px-3 py-1 rounded-full border ${n <= nota ? 'bg-yellow-400 text-black' : 'bg-gray-100'}`}
            onClick={() => setNota(n)}
          >
            {n} ⭐
          </button>
        ))}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Escreva um comentário..."
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={enviarAvaliacao}
        disabled={enviando}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Enviar Avaliação
      </button>
    </div>
  )
}
