import React, { useState, useEffect } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function ChamadaInline({ chamada, usuario, tipo }) {
  const [loading, setLoading] = useState(false)
  const [localStatus, setLocalStatus] = useState(chamada?.status || 'pendente')

  useEffect(() => {
    setLocalStatus(chamada?.status || 'pendente')
  }, [chamada?.status])

  if (!chamada?.id) return null

  const aceitarChamada = async () => {
    if (loading) return
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
    if (loading || chamada.checkInFreela) return
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
    if (loading) return
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        status: 'em_andamento',
        checkInEstabelecimento: true,
        checkInEstabelecimentoHora: serverTimestamp()
      })
      toast.success('Check-in confirmado!')
    } catch (err) {
      toast.error('Erro ao confirmar check-in')
    } finally {
      setLoading(false)
    }
  }

  const checkOutFreela = async () => {
    if (loading || chamada.checkOutFreela) return
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
    if (loading) return
    setLoading(true)
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        status: 'concluido',
        checkOutEstabelecimento: true,
        checkOutEstabelecimentoHora: serverTimestamp()
      })
      toast.success('Checkout confirmado!')
    } catch (err) {
      toast.error('Erro ao confirmar checkout')
    } finally {
      setLoading(false)
    }
  }

  const renderBotoes = () => {
    const status = localStatus

    // Freela aceita chamada pendente
    if ((!status || status === 'pendente') && tipo === 'freela') {
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

    // Freela faz check-in
    if ((status === 'aceita' || status === 'pendente' || status === 'checkin_freela') && 
        tipo === 'freela' && 
        !chamada.checkInFreela) {
      return (
        <button
          onClick={checkInFreela}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
          disabled={loading || chamada.checkInFreela}
        >
          {chamada.checkInFreela ? 'Check-in realizado' : '📍 Fazer check-in'}
        </button>
      )
    }

    // Estabelecimento confirma check-in
    if (tipo === 'estabelecimento' && 
        (status === 'checkin_freela' || status === 'em_andamento') && 
        chamada.checkInFreela && 
        !chamada.checkInEstabelecimento) {
      return (
        <button
          onClick={checkInEstabelecimento}
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition"
          disabled={loading}
        >
          ✅ Confirmar check-in
        </button>
      )
    }

    // Freela faz check-out
    if ((status === 'em_andamento' || status === 'checkout_freela') && 
        tipo === 'freela' && 
        !chamada.checkOutFreela) {
      return (
        <button
          onClick={checkOutFreela}
          className="w-full bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-600 transition"
          disabled={loading || chamada.checkOutFreela}
        >
          {chamada.checkOutFreela ? 'Check-out realizado' : '⏳ Fazer check-out'}
        </button>
      )
    }

    // Estabelecimento confirma checkout
    if (tipo === 'estabelecimento' && 
        status === 'checkout_freela' && 
        !chamada.checkOutEstabelecimento) {
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

    // Chamadas finalizadas
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
      <p><strong>Status:</strong> {localStatus || '---'}</p>
      
      <div className="flex justify-between items-center">
        {chamada.checkInFreela && !chamada.checkInEstabelecimento && tipo === 'freela' && (
          <span className="text-sm text-gray-500">
            Aguardando confirmação do estabelecimento...
          </span>
        )}
        {renderBotoes()}
      </div>
    </div>
  )
}