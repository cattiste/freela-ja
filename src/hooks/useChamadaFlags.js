// src/hooks/useChamadaFlags.js
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useEffect, useMemo, useState } from 'react'

/**
 * Chamada (Firestore) – campos relevantes que o hook usa:
 * - metodoPagamento: 'cartao' | 'pix' | undefined
 * - pagamentoStatus: 'aguardando_pagamento' | 'confirmado' | 'pago' | 'falha' | undefined
 * - status: 'pendente' | 'aceita' | 'confirmada' | 'checkin_freela' | 'em_andamento' | 'checkout_freela' | 'concluido' | ...
 * - checkinFreela, checkinContratante, checkoutFreela, checkoutContratante: boolean
 */
export function useChamadaFlags(chamadaId) {
  const [ch, setCh] = useState(null)

  useEffect(() => {
    if (!chamadaId) return
    const ref = doc(db, 'chamadas', chamadaId)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setCh({ id: snap.id, ...snap.data() })
    })
    return () => unsub()
  }, [chamadaId])

  const flags = useMemo(() => {
    if (!ch) return {}

    const metodo = ch.metodoPagamento
    const ps = String(ch.pagamentoStatus || '').toLowerCase()
    const st = String(ch.status || '').toLowerCase()

    // Pagamento OK:
    // - cartão: status 'pago' OU pagamentoStatus 'confirmado'/'pago'
    // - pix: pagamentoStatus 'confirmado'/'pago' (vem do webhook; em sandbox pode atualizar manualmente para testar)
    const pagoCartao = metodo === 'cartao' && (st === 'pago' || ps === 'confirmado' || ps === 'pago')
    const pagoPix    = metodo === 'pix'    && (ps === 'confirmado' || ps === 'pago')
    const pagamentoOk = Boolean(pagoCartao || pagoPix)

    const podeVerEndereco   = pagamentoOk
    const podeCheckinFreela = pagamentoOk // (adicione validação de raio aqui se quiser: && ch._distanciaOk)
    const podeCheckinContratante   = Boolean(ch.checkinFreela && !ch.checkinContratante)
    const podeCheckoutFreela      = Boolean(ch.checkinFreela && !ch.checkoutFreela)
    const podeCheckoutContratante = Boolean(ch.checkoutFreela && !ch.checkoutContratante)

    return {
      ch,
      pagamentoOk,
      podeVerEndereco,
      podeCheckinFreela,
      podeCheckinContratante,
      podeCheckoutFreela,
      podeCheckoutContratante,
      aguardandoPix: metodo === 'pix' && ps === 'aguardando_pagamento',
    }
  }, [ch])

  return flags
}
