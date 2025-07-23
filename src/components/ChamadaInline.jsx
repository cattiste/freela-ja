
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

  const handleCheckIn = async () => {
    await atualizarChamada({ checkInFreela: true, status: 'aguardando-checkin-estabelecimento' })
  }

  const handleConfirmarCheckIn = async () => {
    await atualizarChamada({ checkInEstabelecimento: true, status: 'em-trabalho' })
  }

  const handleCheckOut = async () => {
    await atualizarChamada({ checkOutFreela: true, status: 'aguardando-checkout-estabelecimento' })
  }

  const handleConfirmarCheckOut = async () => {
    await atualizarChamada({ checkOutEstabelecimento: true, status: 'finalizado' })
  }

  const renderBotoes = () => {
    const status = chamada.status

    if (status === 'aceita') {
      if (tipo === 'freela' && !chamada.checkInFreela) {
        return (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            ✅ Check-In Freela
          </button>
        )
      }
    }

    if (status === 'aguardando-checkin-estabelecimento') {
      if (tipo === 'estabelecimento' && !chamada.checkInEstabelecimento) {
        return (
          <button
            onClick={handleConfirmarCheckIn}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            ✅ Confirmar Check-In
          </button>
        )
      }
    }

    if (status === 'em-trabalho') {
      if (tipo === 'freela' && !chamada.checkOutFreela) {
        return (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            ⏳ Check-Out Freela
          </button>
        )
      }
    }

    if (status === 'aguardando-checkout-estabelecimento') {
      if (tipo === 'estabelecimento' && !chamada.checkOutEstabelecimento) {
        return (
          <button
            onClick={handleConfirmarCheckOut}
            disabled={loading}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            ✅ Confirmar Check-Out
          </button>
        )
      }
    }

    return null
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-md space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-orange-700">{chamada.vagaTitulo}</h3>
          <p className="text-gray-600">Freela: {chamada.freelaNome}</p>
          <p className="text-sm text-gray-500">Status: {statusLocal}</p>
        </div>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => setMostrarChat(prev => !prev)}
        >
          {mostrarChat ? '❌ Fechar Chat' : '💬 Abrir Chat'}
        </button>
      </div>

      {mostrarChat && (
        <div className="mt-2">
          <Chat chamadaId={chamada.id} />
        </div>
      )}

      <div className="mt-3 space-y-2">{renderBotoes()}</div>

      {statusLocal === 'finalizado' && !chamada.avaliacaoEstabelecimentoFeita && (
        <div className="mt-3 border-t pt-2">
          <AvaliacaoEstabelecimento chamada={chamada} />
        </div>
      )}
    </div>
  )
}
