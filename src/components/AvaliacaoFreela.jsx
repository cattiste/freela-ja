import React, { useState, useEffect } from 'react'
import { addDoc, collection, serverTimestamp, doc, updateDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function AvaliacaoFreela({ chamada }) {
  const { usuario } = useAuth()
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [avaliacaoExistente, setAvaliacaoExistente] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔎 Carregar se já existe avaliação do freela
  useEffect(() => {
    const carregarAvaliacao = async () => {
      if (!usuario?.uid || !chamada?.id) return

      try {
        const q = query(
          collection(db, 'avaliacoesContratantes'),
          where('chamadaId', '==', chamada.id),
          where('freelaUid', '==', usuario.uid)
        )
        const snap = await getDocs(q)

        if (!snap.empty) {
          const docData = snap.docs[0].data()
          setAvaliacaoExistente(docData)
        }
      } catch (e) {
        console.error('Erro ao buscar avaliação existente:', e)
      } finally {
        setLoading(false)
      }
    }

    carregarAvaliacao()
  }, [usuario?.uid, chamada?.id])

  const enviarAvaliacao = async () => {
    if (!nota || !comentario) return toast.error('Preencha todos os campos')

    try {
      await addDoc(collection(db, 'avaliacoesContratantes'), {
        chamadaId: chamada.id,
        freelaUid: usuario.uid,
        contratanteUid: chamada.contratanteUid,
        nota,
        comentario,
        criadoEm: serverTimestamp()
      })

      await updateDoc(doc(db, 'chamadas', chamada.id), {
       avaliadoPorFreela: true,
       notaFreela: nota,
       comentarioFreela: comentario,
      })

      setAvaliacaoExistente({ nota, comentario })
      toast.success('Avaliação enviada!')
    } catch (e) {
      console.error('Erro ao enviar avaliação:', e)
      toast.error('Erro ao enviar')
    }
  }

  if (loading) return <p>Carregando avaliação...</p>

  // ✅ Já existe avaliação → mostrar resultado fixo
  if (avaliacaoExistente) {
    return (
      <div className="mt-2 border rounded p-2 bg-gray-50">
        <p className="font-semibold">Sua avaliação:</p>
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`text-xl ${avaliacaoExistente.nota >= n ? 'text-orange-400' : 'text-gray-300'}`}
            >
              ⭐
            </span>
          ))}
        </div>
        <p className="text-gray-700">{avaliacaoExistente.comentario}</p>
      </div>
    )
  }

  // ✍️ Ainda não avaliou → mostrar formulário
  return (
    <div className="mt-2 border rounded p-2">
      <p className="font-semibold">Deixe sua avaliação:</p>
     <div className="flex gap-1 mb-2">
  {[1, 2, 3, 4, 5].map((n) => (
    <button
      key={n}
      type="button"
      onClick={() => setNota(n)}
      className="text-2xl leading-none select-none"
    >
      <span className={nota >= n ? 'text-yellow-500' : 'text-gray-300'}>
        {nota >= n ? '★' : '☆'}
      </span>
    </button>
  ))}
</div>
      <textarea
        className="w-full border rounded p-1"
        placeholder="Escreva um comentário..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
      <button
        onClick={enviarAvaliacao}
        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
      >
        Enviar Avaliação
      </button>
    </div>
  )
}
