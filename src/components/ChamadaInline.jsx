import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import Chat from '@/pages/freelas/Chat' // ✅ CERTO
import AvaliacaoEstabelecimento from './AvaliacaoEstabelecimento'

export default function ChamadaInline({ chamada, onStatusAtualizado }) {
  const [loading, setLoading] = useState(false)
  const [etapa, setEtapa] = useState(chamada.status)
  const [mostrarAvaliacao, setMostrarAvaliacao] = useState(false)
  const [mostrarChat, setMostrarChat] = useState(false)

  const confirmarEtapa = async (tipo) => {
    setLoading(true)
    const chamadaRef = doc(db, 'chamadas', chamada.id)

    try {
      if (tipo === 'checkin') {
        await updateDoc(chamadaRef, { checkInEstabelecimentoConfirmado: true })
        setEtapa('checkin')
      }
      if (tipo === 'checkout') {
        await updateDoc(chamadaRef, { checkOutEstabelecimentoConfirmado: true })
        if (chamada.checkOutFreela) {
          await updateDoc(chamadaRef, { status: 'finalizado' })
          setEtapa('finalizado')
          setMostrarAvaliacao(true)
        } else {
          setEtapa('checkout')
        }
      }

      if (onStatusAtualizado) onStatusAtualizado(tipo)
    } catch (err) {
      console.error(`Erro ao confirmar ${tipo}:`, err)
      alert('Erro ao confirmar etapa.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-3 text-sm">
      <p className="font-semibold text-orange-700 mb-1">📞 Chamada Ativa</p>
      <p><strong>Status:</strong> {etapa}</p>

      {chamada.checkInFreela && !chamada.checkInEstabelecimentoConfirmado && (
        <button
          onClick={() => confirmarEtapa('checkin')}
          disabled={loading}
          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
        >
          ✔️ Confirmar Check-in
        </button>
      )}

      {chamada.checkOutFreela && !chamada.checkOutEstabelecimentoConfirmado && (
        <button
          onClick={() => confirmarEtapa('checkout')}
          disabled={loading}
          className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
        >
          ✔️ Confirmar Check-out
        </button>
      )}

      <button
        onClick={() => setMostrarChat(prev => !prev)}
        className="mt-3 text-blue-600 underline hover:text-blue-800"
      >
        {mostrarChat ? 'Fechar Chat' : 'Abrir Chat'}
      </button>

      {mostrarChat && (
        <div className="mt-2">
          <Chat chamadaId={chamada.id} />
        </div>
      )}

      {etapa === 'finalizado' && !mostrarAvaliacao && (
        <p className="text-green-600 mt-2 font-semibold">✅ Serviço finalizado!</p>
      )}

      {etapa === 'finalizado' && (
        <div className="mt-4">
          <AvaliacaoEstabelecimento
            chamadaId={chamada.id}
            freelaUid={chamada.freelaUid}
            estabelecimentoUid={chamada.estabelecimentoUid}
            onSucesso={() => setMostrarAvaliacao(false)}
          />
        </div>
      )}
    </div>
  )
}
