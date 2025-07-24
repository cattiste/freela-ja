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
    } catch (err) {
      toast.error('Erro ao aceitar chamada')
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
          <button
            onClick={aceitarChamada}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            ✅ Aceitar chamada
          </button>
        )
      }
    }

    
    if ((status === 'aceita' || status === 'pendente') && tipo === 'freela' && !chamada.checkInFreela) {
      return (
        <button
          onClick={checkInFreela}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
          disabled={loading}
        >
          📍 Fazer check-in
        </button>
      )
    }

    if (      
      tipo === 'estabelecimento' &&
      chamada.checkInFreela === true &&
      chamada.checkInEstabelecimento !== true
    ) {
      return (
        <button
          onClick={checkInEstabelecimento}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
          disabled={loading}
        >
          ✅ Confirmar check-in
        </button>
      )
    }

    if ((status === 'checkin_freela' || status === 'em_andamento') && tipo === 'freela' && !chamada.checkOutFreela) {
      return (
        <button
          onClick={checkOutFreela}
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition"
          disabled={loading}
        >
          ⏳ Fazer check-out
        </button>
      )
    }

    if (status === 'checkout_freela' && tipo === 'estabelecimento' && !chamada.checkOutEstabelecimento) {
      return (
        <button
          onClick={checkOutEstabelecimento}
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition"
          disabled={loading}
        >
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
    <div className="border p-4 rounded-xl shadow bg-white mb-4 space-y-3">
      <h2 className="font-bold text-lg text-orange-600">
        Chamada #{chamada?.id?.slice(-5) || '---'}
      </h2>
      <p><strong>Freela:</strong> {chamada.freelaNome || '---'}</p>
      <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome || '---'}</p>
      <p><strong>Status:</strong> {chamada.status || '---'}</p>
      <div>{renderBotoes()}</div>
    </div>
  )
}