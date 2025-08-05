// ChamadasFreela.jsx – Corrigido para exibir observação da chamada

import React, { useEffect, useState } from 'react'
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
import AvaliacaoInline from '@/components/AvaliacaoInline'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'
import ContagemRegressiva from '@/components/ContagemRegressiva'

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371e3
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [distanciaValida, setDistanciaValida] = useState({})
  const [loading, setLoading] = useState(true)
  const [mensagemConfirmacao, setMensagemConfirmacao] = useState(null)

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', 'in', [
        'pendente',
        'aceita',
        'checkin_freela',
        'em_andamento',
        'checkout_freela',
        'concluido',
        'cancelada_por_falta_de_pagamento',
        'rejeitada'
      ])
    )

    const unsub = onSnapshot(q, (snap) => {
      const chamadasAtivas = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      setTimeout(() => {
        setChamadas(chamadasAtivas)
        setLoading(false)
      }, 1000)
    })

    return () => unsub()
  }, [usuario?.uid])

  useEffect(() => {
    chamadas.forEach((chamada) => {
      const estabelecimentoCoords = chamada.estabelecimentoCoordenadas
      if (!estabelecimentoCoords) return

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = calcularDistancia(
            pos.coords.latitude,
            pos.coords.longitude,
            estabelecimentoCoords.latitude,
            estabelecimentoCoords.longitude
          )
          setDistanciaValida((prev) => ({
            ...prev,
            [chamada.id]: dist <= 15
          }))
        },
        (err) => {
          console.error('Erro ao obter localização:', err)
          setDistanciaValida((prev) => ({ ...prev, [chamada.id]: false }))
        },
        { enableHighAccuracy: true }
      )
    })
  }, [chamadas])

  const atualizarChamada = async (id, dados) => {
    try {
      const ref = doc(db, 'chamadas', id)
      await updateDoc(ref, dados)
      toast.success('✅ Ação realizada com sucesso!')
      if (dados.status === 'checkin_freela') {
        setMensagemConfirmacao('✅ Check-in feito! Vá até o caixa ou procure o responsável para confirmar sua presença.')
      }
    } catch (err) {
      console.error('Erro ao atualizar chamada:', err)
      toast.error('Erro ao atualizar chamada.')
    }
  }

  const verificarTimeout = (chamada) => {
    if (chamada.status !== 'aceita') return false
    if (!chamada.aceitaEm?.toMillis) return false
    const aceitaEm = chamada.aceitaEm.toMillis()
    if (!aceitaEm || aceitaEm < 1000000000000) return false
    const limite = 10 * 60 * 1000
    const agora = Date.now()
    const expirou = agora - aceitaEm > limite
    return expirou
  }

  if (!usuario?.uid) {
    return <div className="text-center text-red-600 mt-10">⚠️ Acesso não autorizado. Faça login novamente.</div>
  }

  if (loading) {
    return <div className="text-center text-orange-600 mt-10">🔄 Carregando chamadas...</div>
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📞 Chamadas Recentes</h1>

      {mensagemConfirmacao && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-300 rounded p-3 mb-4 text-center">
          {mensagemConfirmacao}
        </p>
      )}

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada encontrada.</p>
      ) : (
        chamadas.map((chamada) => {
          const expirou = verificarTimeout(chamada)
          if (expirou) {
            atualizarChamada(chamada.id, { status: 'cancelada_por_falta_de_pagamento' })
            return null
          }

          return (
            <div key={chamada.id} className="bg-white shadow p-4 rounded-xl mb-4 border border-orange-200 space-y-2">
              <h2 className="font-semibold text-orange-600 text-lg">Chamada #{chamada?.id?.slice(-5)}</h2>
              <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
              <p><strong>Status:</strong> {chamada.status}</p>

              {chamada.observacao && (
                <p className="text-sm text-gray-800 mt-2">
                  <strong>📝 Observação:</strong> {chamada.observacao}
                </p>
              )}

              {chamada.status === 'pendente' && (
                <>
                  <button
                    onClick={() => atualizarChamada(chamada.id, {
                      status: 'aceita',
                      aceitaEm: serverTimestamp()
                    })}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                  >
                    ✅ Aceitar chamada
                  </button>
                  <button
                    onClick={() => atualizarChamada(chamada.id, {
                      status: 'rejeitada',
                      rejeitadaEm: serverTimestamp()
                    })}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
                  >
                    ❌ Rejeitar chamada
                  </button>
                </>
              )}

              {chamada.status === 'aceita' && chamada.checkInFreela !== true && distanciaValida[chamada.id] && (
                <button
                  onClick={() => atualizarChamada(chamada.id, {
                    status: 'checkin_freela',
                    checkInFreela: true,
                    checkInFreelaHora: serverTimestamp()
                  })}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
                >
                  📍 Fazer check-in
                </button>
              )}

              {(chamada.status === 'checkin_freela' || chamada.status === 'em_andamento') && !chamada.checkOutFreela && (
                <button
                  onClick={() => atualizarChamada(chamada.id, {
                    status: 'checkout_freela',
                    checkOutFreela: true,
                    checkOutFreelaHora: serverTimestamp()
                  })}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition"
                >
                  ⏳ Fazer check-out
                </button>
              )}

              {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
                <>
                  <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
                  <AvaliacaoInline chamada={chamada} tipo="freela" />
                </>
              )}

              {chamada.status === 'cancelada_por_falta_de_pagamento' && (
                <p className="text-sm text-red-600 font-semibold text-center">
                  ❌ Chamada cancelada por falta de pagamento.
                </p>
              )}

              {chamada.status === 'rejeitada' && (
                <p className="text-sm text-red-600 font-semibold text-center">
                  ❌ Chamada rejeitada.
                </p>
              )}

              <RespostasRapidasFreela chamadaId={chamada.id} />
            </div>
          )
        })
      )}
    </div>
  )
}
