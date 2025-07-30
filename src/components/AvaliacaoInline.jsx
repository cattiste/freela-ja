import React, { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function AvaliacaoInline({ chamada, tipo }) {
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!chamada?.id) return null

  const jaAvaliado =
    tipo === 'estabelecimento'
      ? !!chamada.avaliacaoEstabelecimento
      : !!chamada.avaliacaoFreela

  if (jaAvaliado) return null

  const enviarAvaliacao = async () => {
    setEnviando(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      const campo =
        tipo === 'estabelecimento' ? 'avaliacaoEstabelecimento' : 'avaliacaoFreela'

      await updateDoc(ref, {
        [campo]: {
          nota,
          comentario,
          data: serverTimestamp()
        }
      })

      toast.success('Avaliação enviada com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err)
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-orange-50 p-3 rounded-xl mt-2 border border-orange-200 space-y-2">
      <h4 className="text-orange-700 font-bold text-sm">
        Avaliar {tipo === 'estabelecimento' ? 'freelancer' : 'estabelecimento'}
      </h4>

      <div className="space-y-1">
        <label className="text-sm font-medium">Nota:</label>
        <select
          value={nota}
          onChange={(e) => setNota(parseInt(e.target.value, 10))}
          className="w-full rounded border px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} estrela{n > 1 && 's'}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Comentário:</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          className="w-full rounded border px-2 py-1"
          placeholder="Escreva seu feedback..."
        />
      </div>

      <button
        onClick={enviarAvaliacao}
        disabled={enviando || !comentario}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  )
}
