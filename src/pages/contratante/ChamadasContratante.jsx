import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'
import MensagensRecebidasContratante from '@/components/MensagensRecebidasContratante'
import { useChamadaFlags } from '@/hooks/useChamadaFlags'

const STATUS_LISTA = [
  'pendente', 'aceita', 'confirmada', 'checkin_freela',
  'em_andamento', 'checkout_freela', 'pago'
]

export default function ChamadasContratante({ contratante }) {
  const { usuario } = useAuth()
  const estab = contratante || usuario
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!estab?.uid) return
    setLoading(true)
    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', estab.uid),
      where('status', 'in', STATUS_LISTA)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const filtradas = docs.filter((ch) =>
        ch.status !== 'rejeitada' &&
        !(ch.status === 'concluido' && ch.avaliadoPeloContratante) &&
        ch.status !== 'finalizada'
      )
      setChamadas(filtradas)
      setLoading(false)
    }, (err) => {
      console.error('[ChamadasContratante] onSnapshot erro:', err)
      toast.error('Falha ao carregar chamadas.')
      setLoading(false)
    })
    return () => unsub()
  }, [estab?.uid])

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0)
    return [...chamadas].sort((a, b) => ts(b.criadoEm) - ts(a.criadoEm))
  }, [chamadas])

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa.</p>
      ) : (
        chamadasOrdenadas.map((ch) => (
          <ChamadaContratanteItem key={ch.id} ch={ch} estab={estab} />
        ))
      )}
    </div>
  )
}

function ChamadaContratanteItem({ ch, estab }) {
  const {
    podeCheckinContratante,
    podeCheckoutContratante,
    aguardandoPix,
  } = useChamadaFlags(ch.id)

  async function cancelarChamada() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'cancelada',
        canceladaPor: 'contratante',
        canceladaEm: serverTimestamp()
      })
      // opcional: refletir em espelho se você usa
      toast.success('❌ Chamada cancelada.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao cancelar chamada.')
    }
  }

  async function confirmarCheckInFreela() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'em_andamento',
        checkinContratante: true,
        checkinContratanteEm: serverTimestamp()
      })
      toast.success('📍 Check-in do freela confirmado!')
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOutFreela() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'concluido',
        checkoutContratante: true,
        checkoutContratanteEm: serverTimestamp()
      })
      toast.success('⏳ Check-out confirmado!')
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar check-out.')
    }
  }

  return (
    <div className="bg-white shadow p-4 rounded-xl mb-4 border space-y-2">
      <h2 className="font-semibold text-orange-600">Chamada #{String(ch.id).slice(-5)}</h2>
      <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
      <p><strong>Status:</strong> {ch.status}</p>
      {typeof ch.valorDiaria === 'number' && (
        <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
      )}
      {ch.observacao && <p>📝 {ch.observacao}</p>}

      <MensagensRecebidasContratante chamadaId={ch.id} />

      {/* Se quiser, pode esconder completamente infos de Pix aqui.
          Aguardando Pix vira só um aviso discreto: */}
      {aguardandoPix && (
        <div className="text-xs text-yellow-700 bg-yellow-50 border rounded p-2">
          Aguardando confirmação do pagamento…
        </div>
      )}

      {/* Ações: **sem** pagamento; apenas check-ins/outs e cancelar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={confirmarCheckInFreela}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={!podeCheckinContratante}
        >
          📍 Confirmar Check-in
        </button>

        <button
          onClick={confirmarCheckOutFreela}
          className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          disabled={!podeCheckoutContratante}
        >
          ⏳ Confirmar Check-out
        </button>

        {/* Cancelar: sempre disponível */}
        <button
          onClick={cancelarChamada}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          ❌ Cancelar
        </button>
      </div>

      {(ch.status === 'concluido' || ch.status === 'finalizada') && (
        <span className="text-green-600 font-bold block text-center">✅ Finalizada</span>
      )}

      {ch.status === 'concluido' && !ch.avaliadoPeloContratante && (
        <AvaliacaoContratante chamada={ch} />
      )}
    </div>
  )
}
