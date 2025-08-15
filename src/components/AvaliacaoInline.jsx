import React, { useState } from 'react'
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore'
import { db } from '@/firebase'
import toast from 'react-hot-toast'

export default function AvaliacaoInline({ chamada, tipo = 'freela' }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  const jaAvaliado =
    tipo === 'estabelecimento'
      ? !!chamada.avaliacaoFreela?.nota
      : !!chamada.avaliacaoEstabelecimento?.nota

  if (jaAvaliado) return null

  const handleEnviar = async () => {
    if (!nota) return toast.error('Dê uma nota antes de enviar.')

    setEnviando(true)

    const campo =
      tipo === 'estabelecimento' ? 'avaliacaoFreela' : 'avaliacaoEstabelecimento'

    const dados = {
      [campo]: {
        nota,
        comentario,
        criadoEm: serverTimestamp()
      }
    }

    try {
      // ✅ Atualiza o documento da chamada com o campo embutido
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, dados)

      // ✅ Cria um novo documento na coleção correta
      const avaliacaoData = {
        tipo,
        chamadaId: chamada.id,
        nota,
        comentario,
        data: serverTimestamp()
      }

      if (tipo === 'estabelecimento') {
        avaliacaoData.freelaUid = chamada.freelaUid
        avaliacaoData.estabelecimentoUid = chamada.estabelecimentoUid
        await addDoc(collection(db, 'avaliacoesFreelas'), avaliacaoData)
      } else {
        avaliacaoData.freelaUid = chamada.freelaUid
        avaliacaoData.estabelecimentoUid = chamada.estabelecimentoUid
        await addDoc(collection(db, 'avaliacoesEstabelecimentos'), avaliacaoData)
      }

      toast.success('Avaliação enviada com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mt-3 border-t pt-3 border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        {tipo === 'estabelecimento' ? '📋 Avalie o freelancer' : '📋 Avalie o estabelecimento'}
      </h3>

      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setNota(n)}
            className={`w-8 h-8 rounded-full text-white font-bold ${
              nota >= n ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Comentário (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full p-2 border rounded text-sm"
        rows={2}
      />

      <button
        onClick={handleEnviar}
        disabled={enviando || !nota}
        className="mt-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  )
}
