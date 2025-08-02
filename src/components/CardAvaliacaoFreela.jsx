// src/components/CardAvaliacaoFreela.jsx
import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function CardAvaliacaoFreela({ chamada, onAvaliado }) {
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  const freela = chamada?.freela || {}

  const nome = freela?.nome || chamada.freelaNome || 'Freela'
  const foto = freela?.foto || chamada.freelaFoto || 'https://via.placeholder.com/60'

  const enviarAvaliacao = async () => {
    try {
      setEnviando(true)

      await addDoc(collection(db, 'avaliacoes'), {
        tipo: 'freela',
        freelaUid: freela.uid || chamada.freelaUid,
        estabelecimentoUid: chamada.estabelecimentoUid,
        chamadaId: chamada.id,
        nota,
        comentario,
        data: serverTimestamp(),
      })

      await updateDoc(doc(db, 'chamadas', chamada.id), {
        avaliacaoFreela: {
          nota,
          comentario,
          criadoEm: serverTimestamp()
        }
      })

      if (onAvaliado) onAvaliado(chamada.id)
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      alert('Erro ao enviar avaliação.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-orange-200 mb-4">
      <div className="flex items-center gap-4 mb-2">
        <img
          src={foto}
          alt={nome}
          className="w-16 h-16 rounded-full object-cover border border-orange-400"
        />
        <div>
          <h3 className="text-lg font-bold text-orange-700">{nome}</h3>
          <p className="text-sm text-gray-600">{freela.funcao || chamada.freelaFuncao || 'Função não informada'}</p>
        </div>
      </div>

      <label className="block text-sm font-semibold text-gray-700 mt-2">Nota (1 a 5)</label>
      <input
        type="number"
        min="1"
        max="5"
        value={nota}
        onChange={(e) => setNota(parseInt(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 w-20"
      />

      <label className="block text-sm font-semibold text-gray-700 mt-2">Comentário (opcional)</label>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="border border-gray-300 rounded w-full px-3 py-2 mt-1"
        rows={3}
      />

      <button
        onClick={enviarAvaliacao}
        disabled={enviando}
        className="mt-3 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  )
}
