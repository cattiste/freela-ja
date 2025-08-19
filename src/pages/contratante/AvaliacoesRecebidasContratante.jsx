import React, { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function AvaliacaoContratante({ chamadaId, contratanteUid, freelaUid, onSucesso }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [jaAvaliado, setJaAvaliado] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const docId = `${chamadaId}_${freelaUid}`

  // Verifica se já avaliou essa chamada
  useEffect(() => {
    async function checarAvaliacao() {
      const docRef = doc(db, 'avaliacoesContratantes', docId)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        const data = snap.data()
        setNota(data.nota)
        setComentario(data.comentario)
        setJaAvaliado(true)
      }
      setCarregando(false)
    }
    checarAvaliacao()
  }, [docId])

  const enviarAvaliacao = async () => {
    if (nota < 1) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas.')
      return
    }
    try {
      const docRef = doc(db, 'avaliacoesContratantes', docId)
      await setDoc(docRef, {
        chamadaId,
        contratanteUid,
        freelaUid,
        nota,
        comentario,
        criadoEm: serverTimestamp()
      })
      toast.success('Avaliação enviada com sucesso!')
      setJaAvaliado(true)
      if (onSucesso) onSucesso()
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err)
      toast.error('Erro ao enviar avaliação. Tente novamente.')
    }
  }

  if (carregando) return <p>Carregando avaliação...</p>

  return (
    <div className="p-4 border rounded-lg bg-white max-w-md mx-auto shadow">
      <h2 className="text-xl font-semibold mb-4">Avalie o Contratante</h2>

      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            type="button"
            disabled={jaAvaliado}
            onClick={() => setNota(star)}
            className={`text-3xl ${star <= nota ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500 transition`}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        disabled={jaAvaliado}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={4}
        placeholder="Deixe um comentário (opcional)"
        className="w-full p-2 border rounded resize-none"
      />

      <button
        disabled={jaAvaliado}
        onClick={enviarAvaliacao}
        className={`mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
          jaAvaliado ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {jaAvaliado ? 'Avaliação enviada' : 'Enviar avaliação'}
      </button>
    </div>
  )
}
