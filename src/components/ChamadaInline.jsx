
import React, { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function ChamadaInline({ chamada, usuario, tipo }) {
  const [loading, setLoading] = useState(false)

  if (!chamada?.id) return null

  const aceitarChamada = async () => {
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        status: 'aceita',
        aceitaEm: serverTimestamp()
      })
      toast.success('Chamada aceita!')
    } catch {
      toast.error('Erro ao aceitar chamada')
    } finally {
      setLoading(false)
    }
  }

  const recusarChamada = async () => {
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        status: 'recusada',
        recusadaEm: serverTimestamp()
      })
      toast.success('Chamada recusada.')
    } catch {
      toast.error('Erro ao recusar chamada')
    } finally {
      setLoading(false)
    }
  }

  const checkInFreela = async () => {
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        status: 'checkin_freela',
        checkInFreela: true,
        checkInFreelaHora: serverTimestamp()
      })
      toast.success('Check-in realizado!')
    } catch {
      toast.error('Erro ao fazer check-in')
    } finally {
      setLoading(false)
    }
  }

  const checkInEstabelecimento = async () => {
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        checkInEstabelecimento: true,
        checkInEstabelecimentoHora: serverTimestamp(),
        status: 'em_andamento'
      })
      toast.success('Check-in confirmado!')
    } catch {
      toast.error('Erro ao confirmar check-in')
    } finally {
      setLoading(false)
    }
  }

  const checkOutFreela = async () => {
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        status: 'checkout_freela',
        checkOutFreela: true,
        checkOutFreelaHora: serverTimestamp()
      })
      toast.success('Check-out realizado!')
    } catch {
      toast.error('Erro ao fazer check-out')
    } finally {
      setLoading(false)
    }
  }

  const checkOutEstabelecimento = async () => {
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        checkOutEstabelecimento: true,
        checkOutEstabelecimentoHora: serverTimestamp(),
        status: 'concluido'
      })
      toast.success('Checkout confirmado!')
    } catch {
      toast.error('Erro ao confirmar checkout')
    } finally {
      setLoading(false)
    }
  }

  const renderBotoes = () => {
    const status = chamada.status

    if (!status || status === 'pendente') {
      if (tipo === 'freela') {
        return (
          <div className="flex flex-wrap gap-2">
            <button onClick={aceitarChamada} className="btn bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
              ✅ Aceitar chamada
            </button>
            <button onClick={recusarChamada} className="btn bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              ❌ Recusar chamada
            </button>
          </div>
        )
      }
    }

    if (status === 'aceita' && tipo === 'freela' && !chamada.checkInFreela) {
      return (
        <button onClick={checkInFreela} className="btn" disabled={loading}>
          📍 Fazer check-in
        </button>
      )
    }

    if (
      status === 'checkin_freela' &&
      chamada.checkInFreela === true &&
      !chamada.checkInEstabelecimento &&
      tipo === 'estabelecimento'
    ) {
      return (
        <button onClick={checkInEstabelecimento} className="btn" disabled={loading}>
          ✅ Confirmar check-in
        </button>
      )
    }

    if (
      status === 'checkin_freela' &&
      chamada.checkInEstabelecimento === true &&
      tipo === 'freela' &&
      !chamada.checkOutFreela
    ) {
      return (
        <button onClick={checkOutFreela} className="btn" disabled={loading}>
          ⏳ Fazer check-out
        </button>
      )
    }

    if (
      status === 'checkout_freela' &&
      chamada.checkOutFreela === true &&
      tipo === 'estabelecimento' &&
      !chamada.checkOutEstabelecimento
    ) {
      return (
        <button onClick={checkOutEstabelecimento} className="btn" disabled={loading}>
          ✅ Confirmar checkout
        </button>
      )
    }

    if (status === 'concluido' || status === 'finalizada') {
      return <span className="text-green-600 font-bold">✅ Finalizada</span>
    }

    return null
  }

  return (
    <div className="border p-4 rounded-xl shadow bg-white mb-4">
      <h2 className="font-bold text-lg text-orange-600">
        Chamada #{chamada?.id?.slice(-5) || '---'}
      </h2>
      <p><strong>Freela:</strong> {chamada.freelaNome || '---'}</p>
      <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome || '---'}</p>
      <p><strong>Status:</strong> {chamada.status || '---'}</p>
      <div className="mt-4 space-x-2">
        {renderBotoes()}
      </div>
    </div>
  )
}
