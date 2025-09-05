// src/pages/ChamadasContratante.jsx
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
import { getFunctions, httpsCallable } from 'firebase/functions'

const STATUS_LISTA = [
  'pendente', 'aceita', 'confirmada', 'checkin_freela',
  'em_andamento', 'checkout_freela', 'concluido',
  'finalizada', 'cancelada', 'cancelada pelo freela', 'pago'
]

const STATUS_CANCELAVEIS = new Set([
  'pendente',
  'aceita',
  'confirmada',
  'checkin_freela',
  'em_andamento',
  'checkout_freela',
  'concluido',
  'pago'
])

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

  async function cancelarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'cancelada',
        canceladaPor: 'contratante',
        canceladaEm: serverTimestamp()
      })
      // best effort: espelho
      try {
        await updateDoc(doc(db, 'pagamentos_usuarios', ch.id), {
          status: 'cancelada',
          atualizadoEm: serverTimestamp()
        })
      } catch (e2) { /* ok */ }
      toast.success('❌ Chamada cancelada.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao cancelar chamada.')
    }
  }

  // --------- PAGAMENTO: Cartão e Pix ---------
  async function pagarComCartao(ch) {
    try {
      const valorDiaria = Number(ch.valorDiaria || 0)
      const valorTotal = +(valorDiaria * 1.10) // contratante paga diária + 10%

      const functions = getFunctions()
      const cobrar = httpsCallable(functions, 'cobrarCartaoAposAceite')
      const res = await cobrar({
        uidContratante: estab?.uid,
        valorTotal,
        descricao: 'Chamada Freela'
      })

      if (!res?.data?.sucesso) {
        throw new Error('Falha ao processar o pagamento do cartão.')
      }

      // Reflete pagamento na chamada (UI)
      await updateDoc(doc(db, 'chamadas', ch.id), {
        metodoPagamento: 'cartao',
        pagamentoStatus: 'confirmado',
        status: 'pago',
        pagoEm: serverTimestamp()
      })

      toast.success('✅ Pagamento com cartão confirmado!')
    } catch (e) {
      console.error('[pagarComCartao]', e)
      toast.error(e?.message || 'Erro ao pagar com cartão.')
    }
  }

  async function gerarPix(ch) {
    try {
      const valorDiaria = Number(ch.valorDiaria || 0)
      const valorContratante = +(valorDiaria * 1.10)

      const functions = getFunctions()
      const gerar = httpsCallable(functions, 'gerarPixCallable') // nome alinhado ao backend
      const nome = estab?.nome || 'Pagador'
      const documento = (estab?.cpf || estab?.cnpj || '00000000191')

      const r = await gerar({
        chamadaId: ch.id,
        valor: valorContratante,
        pagador: { nome, documento }
      })

      if (!r?.data?.sucesso) {
        throw new Error(r?.data?.message || 'Falha ao gerar Pix.')
      }
      // A própria function já atualiza a chamada com qrCodePix/copiaColaPix/pagamentoStatus

      toast.success('🔗 Pix gerado! Escaneie o QR ou use Copia-e-Cola.')
    } catch (e) {
      console.error('[gerarPix]', e)
      toast.error(e?.message || 'Erro ao gerar Pix.')
    }
  }
  // -------------------------------------------

  async function confirmarCheckInFreela(ch) {
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

  async function confirmarCheckOutFreela(ch) {
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

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa.</p>
      ) : chamadasOrdenadas.map((ch) => {
        const {
          pagamentoOk,
          podeCheckinContratante,
          podeCheckoutContratante,
          aguardandoPix,
        } = useChamadaFlags(ch.id)

        return (
          <div key={ch.id} className="bg-white shadow p-4 rounded-xl mb-4 border space-y-2">
            <h2 className="font-semibold text-orange-600">Chamada #{String(ch.id).slice(-5)}</h2>
            <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
            <p><strong>Status:</strong> {ch.status}</p>
            {typeof ch.valorDiaria === 'number' && (
              <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
            )}
            {ch.observacao && <p>📝 {ch.observacao}</p>}

            <MensagensRecebidasContratante chamadaId={ch.id} />

            {ch.status === 'concluido' && !ch.avaliadoPeloContratante && (
              <AvaliacaoContratante chamada={ch} />
            )}

            {(ch.qrCodePix || ch.copiaColaPix) && (
              <div className="bg-gray-50 border rounded-lg p-2 text-center">
                <p className="font-semibold text-green-600">✅ Pix gerado</p>
                {ch.qrCodePix && <img src={ch.qrCodePix} alt="QR Code Pix" className="mx-auto w-40" />}
                {ch.copiaColaPix && <p className="text-xs break-all">{ch.copiaColaPix}</p>}
                {aguardandoPix && (
                  <p className="text-xs text-yellow-700 mt-1">Aguardando pagamento…</p>
                )}
              </div>
            )}

            {/* Ações: pagamento só se ainda não estiver pago/confirmado */}
            {!pagamentoOk && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => pagarComCartao(ch)}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  💳 Pagar com Cartão
                </button>
                <button
                  onClick={() => gerarPix(ch)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  💸 Gerar Pix
                </button>
                {STATUS_CANCELAVEIS.has(ch.status) && (
                  <button
                    onClick={() => cancelarChamada(ch)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            )}

            {/* Check-ins / outs do contratante */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => confirmarCheckInFreela(ch)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={!podeCheckinContratante}
              >
                📍 Confirmar Check-in
              </button>

              <button
                onClick={() => confirmarCheckOutFreela(ch)}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                disabled={!podeCheckoutContratante}
              >
                ⏳ Confirmar Check-out
              </button>
            </div>

            {(ch.status === 'concluido' || ch.status === 'finalizada') && (
              <span className="text-green-600 font-bold block text-center">✅ Finalizada</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
