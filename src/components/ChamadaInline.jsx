import React, { useEffect, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import Chat from '@/pages/Chat'
import AvaliacaoEstabelecimento from './AvaliacaoEstabelecimento'

export default function ChamadaInline({ chamada, usuario, tipo }) {
  const [mostrarChat, setMostrarChat] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusLocal, setStatusLocal] = useState(chamada.status)

  useEffect(() => {
    setStatusLocal(chamada.status)
  }, [chamada.status])

  const atualizarChamada = async (dados) => {
    setLoading(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), dados)
    } catch (err) {
      console.error('Erro ao atualizar chamada:', err)
      alert('Erro ao atualizar chamada.')
    }
    setLoading(false)
  }

  const handleAceitar = async () => {
    await atualizarChamada({ status: 'aceita' })
  }

  const handleRecusar = async () => {
    await atualizarChamada({ status: 'recusada' })
  }

  const handleCheckIn = async () => {
    await atualizarChamada({ checkInFreela: true, status: 'checkin_freela' })
  }

  const handleConfirmarCheckIn = async () => {
    await atualizarChamada({ checkInEstabelecimento: true, status: 'em-trabalho' })
  }

  const handleCheckOut = async () => {
    await atualizarChamada({ checkOutFreela: true, status: 'checkout_freela' })
  }

  const handleConfirmarCheckOut = async () => {
    await atualizarChamada({ checkOutEstabelecimento: true, status: 'finalizado' })
  }

  const renderBotoes = () => {
    const status = chamada.status

    if ((status === 'pendente' || !status) && tipo === 'freela') {
      return (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAceitar}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            ✅ Aceitar Chamada
          </button>
          <button
            onClick={handleRecusar}
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            ❌ Recusar Chamada
          </button>
        </div>
      )
    }

    if (status === 'aceita' && tipo === 'freela' && !chamada.checkInFreela) {
      return (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          ✅ Fazer Check-In
        </button>
      )
    }

    if (
      status === 'checkin_freela' &&
      tipo === 'estabelecimento' &&
      chamada.checkInFreela === true &&
      chamada.checkInEstabelecimento !== true
    ) {
      return (
        <button
          onClick={handleConfirmarCheckIn}
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          ✅ Confirmar Check-In
        </button>
      )
    }

    if (status === 'em-trabalho' && tipo === 'freela' && !chamada.checkOutFreela) {
      return (
        <button
          onClick={handleCheckOut}
          disabled={loading}
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition"
        >
          ⏳ Fazer Check-Out
        </button>
      )
    }

    if (
      status === 'checkout_freela' &&
      tipo === 'estabelecimento' &&
      chamada.checkOutFreela &&
      !chamada.checkOutEstabelecimento
    ) {
      return (
        <button
          onClick={handleConfirmarCheckOut}
          disabled={loading}
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition"
        >
          ✅ Confirmar Check-Out
        </button>
      )
    }

    return null
  }

  return (
    <div className="border rounded-xl p-4 bg-white shadow space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-orange-700">Chamada #{chamada?.id?.slice(-5)}</h3>
          <p className="text-sm text-gray-700">👤 {chamada.freelaNome}</p>
          <p className="text-sm text-gray-500">📌 Status: {statusLocal}</p>
        </div>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => setMostrarChat(prev => !prev)}
        >
          {mostrarChat ? '❌ Fechar Chat' : '💬 Chat'}
        </button>
      </div>

      {mostrarChat && (
        <div className="border-t pt-2">
          <Chat chamadaId={chamada.id} />
        </div>
      )}

      <div>{renderBotoes()}</div>

      {statusLocal === 'finalizado' && !chamada.avaliacaoEstabelecimentoFeita && (
        <div className="mt-4 border-t pt-3">
          <AvaliacaoEstabelecimento chamada={chamada} />
        </div>
      )}
    </div>
  )
}