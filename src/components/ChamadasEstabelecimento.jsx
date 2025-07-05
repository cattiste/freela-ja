import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loadingId, setLoadingId] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState({})

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['aceita', 'checkin', 'checkout'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  async function confirmarEtapa(chamada, etapa) {
    setLoadingId(chamada.id)
    const chamadaRef = doc(db, 'chamadas', chamada.id)
    try {
      if (etapa === 'checkin') {
        await updateDoc(chamadaRef, { checkInEstabelecimentoConfirmado: true })
      }

      if (etapa === 'checkout') {
        await updateDoc(chamadaRef, { checkOutEstabelecimentoConfirmado: true })

        if (chamada.checkOutFreela) {
          await updateDoc(chamadaRef, { status: 'finalizado' })
        }
      }
    } catch (err) {
      console.error(`Erro ao confirmar ${etapa}:`, err)
      alert('Erro ao confirmar etapa.')
    }
    setLoadingId(null)
  }

  const enviarAvaliacao = async (chamadaId, freelaUid, nota, comentario) => {
    try {
      await addDoc(collection(db, 'avaliacoesFreelas'), {
        chamadaId,
        freelaUid,
        estabelecimentoUid: estabelecimento.uid,
        nota,
        comentario,
        dataCriacao: serverTimestamp()
      })

      await updateDoc(doc(db, 'chamadas', chamadaId), {
        avaliacaoEstabelecimentoFeita: true
      })

      toast.success('Avaliação enviada com sucesso!')
      setAvaliacoes((prev) => ({ ...prev, [chamadaId]: { nota, comentario } }))
    } catch (err) {
      toast.error('Erro ao enviar avaliação.')
      console.error(err)
    }
  }

  const formatarData = (data) => {
    try {
      return data?.toDate().toLocaleString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

  return (
    <div className="space-y-4">
      {chamadas.length === 0 && (
        <p className="text-gray-600 text-center mt-6">Nenhuma chamada ativa no momento.</p>
      )}

      {chamadas.map(chamada => (
        <div
          key={chamada.id}
          className="bg-white rounded-2xl shadow-md border border-orange-100 p-5 transition hover:shadow-lg hover:border-orange-300 space-y-2"
        >
          <p><strong>Vaga:</strong> {chamada.vagaTitulo}</p>
          <p><strong>Freela:</strong> {chamada.freelaNome}</p>
          <p><strong>Data da chamada:</strong> {formatarData(chamada.criadoEm)}</p>
          <p><strong>Status da chamada:</strong> <span className="font-semibold text-orange-700">{chamada.status}</span></p>

          <p>
            <strong>Check-in:</strong>{' '}
            {chamada.checkInFreela
              ? chamada.checkInEstabelecimentoConfirmado
                ? '✅ Confirmado'
                : '⏳ Aguardando confirmação'
              : '❌ Ainda não realizado'}{' '}
              {chamada.checkInHora && <span className="text-sm text-gray-600">({formatarData(chamada.checkInHora)})</span>}
          </p>

          <p>
            <strong>Check-out:</strong>{' '}
            {chamada.checkOutFreela
              ? chamada.checkOutEstabelecimentoConfirmado
                ? '✅ Confirmado'
                : '⏳ Aguardando confirmação'
              : '❌ Ainda não realizado'}{' '}
              {chamada.checkOutHora && <span className="text-sm text-gray-600">({formatarData(chamada.checkOutHora)})</span>}
          </p>

          <div className="flex gap-2 flex-wrap mt-2">
            {chamada.checkInFreela && !chamada.checkInEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkin')}
                disabled={loadingId === chamada.id}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                {loadingId === chamada.id ? 'Aguarde...' : '✅ Confirmar Check-in'}
              </button>
            )}

            {chamada.checkOutFreela && !chamada.checkOutEstabelecimentoConfirmado && (
              <button
                onClick={() => confirmarEtapa(chamada, 'checkout')}
                disabled={loadingId === chamada.id}
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                {loadingId === chamada.id ? 'Aguarde...' : '✅ Confirmar Check-out'}
              </button>
            )}
          </div>

          {chamada.checkOutEstabelecimentoConfirmado && !chamada.avaliacaoEstabelecimentoFeita && !avaliacoes[chamada.id] && (
            <div className="mt-4 border-t pt-3">
              <h3 className="text-lg font-semibold mb-2">📝 Avalie o freelancer</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const nota = parseInt(e.target.nota.value)
                  const comentario = e.target.comentario.value.trim()
                  if (comentario.length < 5) {
                    toast.error('Comentário deve ter pelo menos 5 caracteres.')
                    return
                  }
                  enviarAvaliacao(chamada.id, chamada.freelaUid, nota, comentario)
                }}
                className="flex flex-col gap-2"
              >
                <label>
                  Nota:
                  <select name="nota" className="ml-2 border p-1 rounded" defaultValue="5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <textarea
                  name="comentario"
                  placeholder="Comentário"
                  className="border p-2 rounded"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Enviar Avaliação
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
