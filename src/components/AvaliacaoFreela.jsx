import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import toast from 'react-hot-toast'

export default function AvaliacaoFreela({ estabelecimento }) {
  const [chamadasParaAvaliar, setChamadasParaAvaliar] = useState([])
  const [avaliandoId, setAvaliandoId] = useState(null)
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', '==', 'finalizado'),
      where('avaliacaoEstabelecimentoFeita', '==', false)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chamadas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadasParaAvaliar(chamadas)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao buscar chamadas para avaliação:', error)
      toast.error('Erro ao carregar chamadas para avaliação.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [estabelecimento?.uid])

  async function enviarAvaliacao() {
    if (!avaliandoId) return

    setLoading(true)

    try {
      // Salvar avaliação na coleção de avaliações dos freelas
      await addDoc(collection(db, 'avaliacoesFreelas'), {
        chamadaId: avaliandoId,
        estabelecimentoUid: estabelecimento.uid,
        freelaUid: chamadasParaAvaliar.find(c => c.id === avaliandoId).freelaUid,
        nota,
        comentario,
        dataCriacao: serverTimestamp()
      })

      // Atualizar chamada para marcar avaliação feita
      await updateDoc(doc(db, 'chamadas', avaliandoId), {
        avaliacaoEstabelecimentoFeita: true
      })

      toast.success('Avaliação enviada com sucesso!')

      // Limpar campos e atualizar lista
      setAvaliandoId(null)
      setNota(5)
      setComentario('')
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err)
      toast.error('Erro ao enviar avaliação. Tente novamente.')
    }

    setLoading(false)
  }

  if (loading) {
    return <p className="text-center text-gray-600">Carregando chamadas para avaliação...</p>
  }

  if (chamadasParaAvaliar.length === 0) {
    return <p className="text-center text-gray-600">Nenhuma avaliação pendente.</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-orange-700 mb-4">Avalie os Freelancers finalizados</h2>

      <ul className="space-y-4">
        {chamadasParaAvaliar.map(chamada => (
          <li key={chamada.id} className="border rounded p-4 bg-white shadow-sm">
            <p><strong>Freelancer:</strong> {chamada.freelaNome}</p>
            <p><strong>Serviço:</strong> {chamada.servico || 'Não informado'}</p>
            <p><strong>Data finalização:</strong> {chamada.checkOutFreelaHora?.toDate?.().toLocaleString() || 'Data indisponível'}</p>

            <button
              onClick={() => setAvaliandoId(chamada.id)}
              disabled={avaliandoId === chamada.id}
              className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              {avaliandoId === chamada.id ? 'Avaliar este' : 'Avaliar'}
            </button>
          </li>
        ))}
      </ul>

      {avaliandoId && (
        <div className="mt-6 p-4 border rounded bg-orange-50">
          <h3 className="font-semibold mb-2">Avaliar Freelancer</h3>

          <label className="block mb-1 font-medium">Nota (1 a 5):</label>
          <select
            value={nota}
            onChange={e => setNota(Number(e.target.value))}
            className="mb-3 p-2 border rounded w-full max-w-xs"
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Comentário (opcional):</label>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            className="mb-3 p-2 border rounded w-full max-w-md"
            rows={4}
          />

          <div className="flex gap-4">
            <button
              onClick={enviarAvaliacao}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
            <button
              onClick={() => {
                setAvaliandoId(null)
                setNota(5)
                setComentario('')
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}