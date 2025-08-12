// src/components/CardAvaliacaoFreelaPF.jsx
import React, { useState } from 'react'
import { db } from '@/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function CardAvaliacaoFreelaPF({ chamada }) {
  const { usuario } = useAuth()
  const [nota, setNota] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviarAvaliacao = async () => {
    if (!nota || !comentario) {
      toast.error('Preencha todos os campos!')
      return
    }

    try {
      setEnviando(true)
      await addDoc(collection(db, 'avaliacoesFreelas'), {
        freelaUid: chamada.freelaUid,
        freelaNome: chamada.freelaNome,
        estabelecimentoUid: usuario.uid,
        estabelecimentoNome: usuario.nome,
        nota: Number(nota),
        comentario,
        criadoEm: serverTimestamp()
      })

      toast.success('Avaliação enviada com sucesso!')
      setNota('')
      setComentario('')
    } catch (error) {
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-orange-200 space-y-2 mt-4">
      <p className="font-bold text-orange-700">Avaliar Freelancer</p>
      <select
        value={nota}
        onChange={e => setNota(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">Nota</option>
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      <textarea
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        className="w-full border rounded p-2"
        placeholder="Comentário sobre o freela"
        rows={3}
      />

      <button
        onClick={enviarAvaliacao}
        disabled={enviando}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
      >
        Enviar Avaliação
      </button>
    </div>
  )
}
