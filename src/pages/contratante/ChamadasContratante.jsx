import React, { useEffect, useMemo, useState } from 'react'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'

const STATUS_LISTA = [
  'pendente',
  'aceita',
  'confirmada',
  'checkin_freela',
  'em_andamento',
  'checkout_freela',
  'pago',
  'concluido'
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
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const filtradas = docs.filter(
          (ch) =>
            ch.status !== 'rejeitada' &&
            !(ch.status === 'concluido' && ch.avaliadoPeloContratante) &&
            ch.status !== 'finalizada'
        )
        setChamadas(filtradas)
        setLoading(false)
      },
      (err) => {
        console.error('[ChamadasContratante] onSnapshot erro:', err)
        toast.error('Falha ao carregar chamadas.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [estab?.uid])

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0)
    return [...chamadas].sort((a, b) => ts(b.criadoEm) - ts(a.criadoEm))
  }, [chamadas])

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📡 Chamadas Ativas
      </h1>

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
  let statusEfetivo = ch.status
  if (statusEfetivo === 'aceita' && ch.pagamento?.status === 'pago') {
    statusEfetivo = 'pago'
  }

  const [freelaData, setFreelaData] = useState(null)
  const [avaliacao, setAvaliacao] = useState(null)

  useEffect(() => {
    if (!ch.freelaUid) return
    const ref = doc(db, 'usuarios', ch.freelaUid)
    getDoc(ref).then((snap) => {
      if (snap.exists()) setFreelaData(snap.data())
    })
  }, [ch.freelaUid])

  // 🔎 Escuta avaliação já feita
  useEffect(() => {
    if (!ch.id) return
    const q = query(
      collection(db, 'avaliacoesFreelas'),
      where('chamadaId', '==', ch.id),
      where('contratanteUid', '==', estab.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setAvaliacao(snap.docs[0].data())
      }
    })
    return () => unsub()
  }, [ch.id, estab.uid])

  async function confirmarCheckin() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'em_andamento',
        checkinContratante: true,
        checkinContratanteEm: serverTimestamp(),
      })
      toast.success('📍 Check-in confirmado!')
    } catch (error) {
      console.error('Erro ao confirmar check-in:', error)
      toast.error('Falha ao confirmar check-in')
    }
  }

  async function confirmarCheckout() {
  try {
    // 1. Atualiza status no Firestore
    await updateDoc(doc(db, 'chamadas', ch.id), {
      status: 'concluido',
      checkoutContratante: true,
      checkoutContratanteEm: serverTimestamp(),
    })

    // 2. Chama backend para repassar Pix
    const response = await fetch(
      `https://api-kbaliknhja-uc.a.run.app/api/pix/transferir`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chamadaId: ch.id }),
      }
    )

    if (!response.ok) throw new Error('Falha no repasse Pix')

    const data = await response.json()
    console.log('✅ Repasse Pix realizado:', data)

    toast.success('⏳ Check-out confirmado e pagamento enviado!')
  } catch (error) {
    console.error('Erro ao confirmar check-out:', error)
    toast.error('Falha ao confirmar check-out')
  }
}


  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border border-orange-200 space-y-2">
      <h2 className="font-semibold text-orange-600">
        Chamada #{String(ch.id).slice(-5)}
      </h2>

      <div className="flex items-center gap-3">
        <img
          src={freelaData?.foto || "https://via.placeholder.com/80"}
          alt={ch.freelaNome}
          className="w-16 h-16 rounded-full border object-cover"
        />
        <div>
          <p className="font-semibold text-gray-800">
            {ch.freelaNome || ch.freelaUid}
          </p>
          <p className="text-sm text-gray-600">Freelancer</p>
        </div>
      </div>

      <p><strong>Status:</strong> {statusEfetivo}</p>
      {typeof ch.valorDiaria === 'number' && (
        <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
      )}
      {ch.observacao && <p>📝 {ch.observacao}</p>}

      {/* Código numérico simples */}
      {statusEfetivo === 'pago' && ch.codigoCheckin && (
        <div className="mt-4 p-3 bg-gray-50 border rounded text-center">
          <p className="text-sm text-gray-600 mb-2">
            Informe este código ao freela para confirmar o check-in:
          </p>
          <p className="text-2xl font-bold tracking-widest text-orange-600">
            {ch.codigoCheckin}
          </p>
        </div>
      )}
      
{/* Confirmar checkin */}
{(statusEfetivo === 'aceita' || statusEfetivo === 'pago' || statusEfetivo === 'checkin_freela') &&
  ch.checkinFreela &&
  !ch.checkinContratante && (
    <button
      onClick={confirmarCheckin}
      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      ✅ Confirmar Check-in
    </button>
  )}


      {/* Confirmar checkout */}
      {(statusEfetivo === 'pago' || statusEfetivo === 'checkout_freela') &&
        ch.checkoutFreela &&
        !ch.checkoutContratante && (
          <button
            onClick={confirmarCheckout}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ✅ Confirmar Check-out
          </button>
        )}

      {/* Avaliação */}
      {(statusEfetivo === 'concluido' || statusEfetivo === 'finalizada') ? (
        <>
          {!avaliacao ? (
            <AvaliacaoContratante chamada={ch} />
          ) : (
            <div className="mt-2 border rounded p-2 bg-gray-50">
              <p className="font-semibold">Sua avaliação:</p>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`text-xl ${avaliacao.nota >= n ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    {avaliacao.nota >= n ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-gray-700">{avaliacao.comentario}</p>
            </div>
          )}
          <span className="block mt-2 text-green-600 font-semibold text-center">
            ✅ Chamada finalizada
          </span>
        </>
      ) : null}
    </div>
  )
}

