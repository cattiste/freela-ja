// ✅ ChamadasFreela.jsx com Avaliação e Respostas Rápidas
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import AvaliacaoInline from '@/components/AvaliacaoInline'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [coordenadas, setCoordenadas] = useState(null)

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', 'in', [
        'pendente',
        'aceita',
        'confirmada',
        'checkin_freela',
        'em_andamento',
        'checkout_freela',
        'concluido',
        'finalizada',
      ])
    )

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setChamadas(docs)
    })

    return () => unsub()
  }, [usuario?.uid])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
      },
      (err) => {
        console.warn('Erro ao obter localização:', err)
      }
    )
  }, [])

  async function aceitarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'aceita',
        aceitaEm: serverTimestamp(),
      })
      toast.success('✅ Chamada aceita!')
    } catch (e) {
      console.error('Erro ao aceitar chamada:', e)
      toast.error('Erro ao aceitar chamada.')
    }
  }

  async function fazerCheckIn(ch) {
    try {
      let endereco = null

      if (coordenadas) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordenadas.latitude}&lon=${coordenadas.longitude}`
        const resp = await fetch(url, { headers: { 'User-Agent': 'freelaja.com.br' } })
        const data = await resp.json()
        endereco = data.display_name || null
      }

      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'checkin_freela',
        checkInFeitoPeloFreela: true,
        checkInFeitoPeloFreelaHora: serverTimestamp(),
        coordenadasCheckInFreela: coordenadas || null,
        enderecoCheckInFreela: endereco || null,
      })
      toast.success('📍 Check-in realizado!')
    } catch (e) {
      console.error('Erro ao fazer check-in:', e)
      toast.error('Erro ao fazer check-in.')
    }
  }

  async function fazerCheckOut(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'checkout_freela',
        checkOutFeitoPeloFreela: true,
        checkOutFeitoPeloFreelaHora: serverTimestamp(),
      })
      toast.success('⏳ Check-out realizado!')
    } catch (e) {
      console.error('Erro ao fazer check-out:', e)
      toast.error('Erro ao fazer check-out.')
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📲 Minhas Chamadas
      </h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma chamada no momento.</p>
      ) : (
        chamadas.map((ch) => (
          <div
            key={ch.id}
            className="bg-white border border-orange-200 rounded-xl shadow p-4 mb-4 space-y-2"
          >
            <h2 className="font-semibold text-orange-600 text-lg">
              Chamada #{ch.id.slice(-5)}
            </h2>
            <p><strong>Contratante:</strong> {ch.contratanteNome || ch.contratanteUid}</p>
            <p><strong>Status:</strong> {ch.status}</p>
            {typeof ch.valorDiaria === 'number' && (
              <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
            )}
            {ch.observacao && (
              <p><strong>📝 Observação:</strong> {ch.observacao}</p>
            )}

            {ch.status === 'pendente' && (
              <button
                onClick={() => aceitarChamada(ch)}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                ✅ Aceitar Chamada
              </button>
            )}

            {ch.status === 'confirmada' && (
              <button
                onClick={() => fazerCheckIn(ch)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                📍 Fazer Check-in
              </button>
            )}

            {ch.status === 'em_andamento' && (
              <button
                onClick={() => fazerCheckOut(ch)}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                ⏳ Fazer Check-out
              </button>
            )}

            {ch.status === 'concluido' && (
              <AvaliacaoInline chamada={ch} tipo="contratante" />
            )}

            <RespostasRapidasFreela chamadaId={ch.id} />

            {(ch.status === 'concluido' || ch.status === 'finalizada') && (
              <span className="text-green-600 font-bold block text-center">
                ✅ Finalizada
              </span>
            )}
          </div>
        ))
      )}
    </div>
  )
}
