import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'
import MensagensRecebidasContratante from '@/components/MensagensRecebidasContratante'

const STATUS_LISTA = [
  'pendente', 'aceita', 'confirmada', 'checkin_freela',
  'em_andamento', 'checkout_freela', 'concluido',
  'finalizada', 'cancelada_por_falta_de_pagamento', 'rejeitada'
]

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
      setChamadas(docs)
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

  async function confirmarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'confirmada', confirmadaEm: serverTimestamp()
      })
      toast.success('✅ Chamada confirmada!')
    } catch (e) {
      console.error('[ChamadasContratante] confirmarChamada erro:', e)
      toast.error('Erro ao confirmar chamada.')
    }
  }

  async function cancelarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'cancelada_por_falta_de_pagamento', canceladaEm: serverTimestamp()
      })
      toast.success('❌ Chamada cancelada.')
    } catch (e) {
      console.error('[ChamadasContratante] cancelarChamada erro:', e)
      toast.error('Erro ao cancelar chamada.')
    }
  }

  async function confirmarCheckInFreela(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'em_andamento',
        checkInConfirmadoPeloEstab: true,
        checkInConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('📍 Check-in do freela confirmado!')
    } catch (e) {
      console.error('[ChamadasContratante] confirmarCheckInFreela erro:', e)
      toast.error('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOutFreela(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'concluido',
        checkOutConfirmadoPeloEstab: true,
        checkOutConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('⏳ Check-out do freela confirmado!')
    } catch (e) {
      console.error('[ChamadasContratante] confirmarCheckOutFreela erro:', e)
      toast.error('Erro ao confirmar check-out.')
    }
  }

  if (loading) return <div className="text-center text-orange-600 mt-8">🔄 Carregando chamadas…</div>
  if (!estab?.uid) return <div className="text-center text-red-600 mt-8">⚠️ Contratante não autenticado.</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>
      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa no momento.</p>
      ) : (
        chamadasOrdenadas.map((ch) => {
          const pos = ch.coordenadasCheckInFreela
          const dataHora = ch.checkInFeitoPeloFreelaHora?.seconds
            ? new Date(ch.checkInFeitoPeloFreelaHora.seconds * 1000).toLocaleString()
            : null

          return (
            <div key={ch.id} className="bg-white shadow p-4 rounded-xl mb-4 border border-orange-200 space-y-2">
              <h2 className="font-semibold text-orange-600 text-lg">Chamada #{ch?.id?.slice(-5)}</h2>
              <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
              <p><strong>Status:</strong> {ch.status}</p>
              {typeof ch.valorDiaria === 'number' && <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>}
              {ch.observacao && <p className="text-sm text-gray-800"><strong>📝 Observação:</strong> {ch.observacao}</p>}
              {dataHora && (<p className="text-sm text-gray-700">🕓 Check-in: {dataHora}</p>)}
              {ch.enderecoCheckInFreela && (<p className="text-sm text-gray-700">🏠 Endereço: {ch.enderecoCheckInFreela}</p>)}
              {pos && (
                <>
                  <p className="text-sm text-gray-700">
                    📍 Coordenadas: {pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)} {' '}
                    <a
                      href={`https://www.google.com/maps?q=${pos.latitude},${pos.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline ml-2"
                    >Ver no Google Maps</a>
                  </p>
                  <MapContainer center={[pos.latitude, pos.longitude]} zoom={18} scrollWheelZoom={false} style={{ height: 200, borderRadius: 8 }} className="mt-2">
                    <TileLayer attribution='&copy; OpenStreetMap' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                    <Marker position={[pos.latitude, pos.longitude]} />
                  </MapContainer>
                </>
              )}

              <MensagensRecebidasContratante chamadaId={ch.id} />

              {ch.status === 'concluido' && (                
                <AvaliacaoFreela chamada={ch} />
              )}

              {ch.status === 'aceita' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => confirmarChamada(ch)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">✅ Confirmar Chamada</button>
                  <button onClick={() => cancelarChamada(ch)} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">❌ Cancelar Chamada</button>
                </div>
              )}
              {ch.status === 'checkin_freela' && (
                <button onClick={() => confirmarCheckInFreela(ch)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">📍 Confirmar check-in do freela</button>
              )}
              {ch.status === 'checkout_freela' && (
                <button onClick={() => confirmarCheckOutFreela(ch)} className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">⏳ Confirmar check-out do freela</button>
              )}
              {(ch.status === 'concluido' || ch.status === 'finalizada') && (
                <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
