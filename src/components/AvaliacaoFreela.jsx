// src/components/AvaliacaoFreela.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import toast from 'react-hot-toast'

export default function AvaliacaoFreela({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [nota, setNota] = useState({})
  const [comentario, setComentario] = useState({})
  const [enviando, setEnviando] = useState(null)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['concluido', 'finalizada']),
      where('avaliacaoFreelaFeita', '==', false)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  const handleEnviar = async (chamada) => {
    const id = chamada.id
    const notaEnviada = nota[id]
    const texto = comentario[id] || ''

    if (!notaEnviada) {
      toast.error('Dê uma nota antes de enviar.')
      return
    }

    setEnviando(id)

    try {
      const docId = `${id}_${chamada.freelaUid}`
      await setDoc(doc(db, 'avaliacoesFreelas', docId), {
        chamadaId: id,
        freelaUid: chamada.freelaUid,
        estabelecimentoUid: estabelecimento.uid,
        nota: notaEnviada,
        comentario: texto,
        criadoEm: serverTimestamp()
      })

      await updateDoc(doc(db, 'chamadas', id), {
        avaliacaoFreelaFeita: true
      })

      toast.success('✅ Avaliação enviada com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setEnviando(null)
    }
  }

  if (chamadas.length === 0) {
    return <p className="text-center text-gray-600 mt-6">Nenhuma avaliação pendente.</p>
  }

  return (
    <div className="space-y-4">
      {chamadas.map((chamada) => (
        <div key={chamada.id} className="p-4 bg-white rounded-xl shadow border border-orange-100">
          <h3 className="text-orange-700 font-bold text-lg mb-1">
            Avaliar freelancer: {chamada.freelaNome}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Serviço finalizado • Valor diário: R$ {chamada.valorDiaria}
          </p>

          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setNota(prev => ({ ...prev, [chamada.id]: n }))}
                className={`w-8 h-8 rounded-full text-white font-bold ${
                  nota[chamada.id] >= n ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Comentário (opcional)"
            value={comentario[chamada.id] || ''}
            onChange={(e) =>
              setComentario((prev) => ({ ...prev, [chamada.id]: e.target.value }))
            }
            className="w-full p-2 border rounded text-sm mb-2"
            rows={2}
          />

          <button
            onClick={() => handleEnviar(chamada)}
            disabled={enviando === chamada.id || !nota[chamada.id]}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
          >
            {enviando === chamada.id ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      ))}
    </div>
  )
}
