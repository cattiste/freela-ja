// src/pages/freela/ChamadasFreela.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const toRad = (v) => (v * Math.PI) / 180
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
  const [pos, setPos] = useState(null)

  // pegar geolocalização do freela (para check-in)
  useEffect(() => {
    const watch = navigator.geolocation?.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => console.warn('geo error', e),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
    return () => {
      if (watch && navigator.geolocation?.clearWatch) navigator.geolocation.clearWatch(watch)
    }
  }, [])

  // minhas chamadas
  useEffect(() => {
    if (!usuario?.uid) return
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid),
      where('status', 'in', ['aceita', 'pago', 'em_andamento', 'checkout_freela'])
    )
    const unsub = onSnapshot(q, (snap) => {
      const lista = []
      snap.forEach((d) => lista.push({ id: d.id, ...d.data() }))
      setChamadas(lista)
    })
    return () => unsub()
  }, [usuario?.uid])

  const fazerCheckIn = async (ch) => {
    try {
      if (!pos) {
        toast.error('Ative sua localização para fazer check-in')
        return
      }
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'checkin_freela',
        freelaCheckinHora: serverTimestamp(),
        freelaCheckinGeo: pos
      })
      toast.success('Check-in enviado para confirmação do contratante')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao fazer check-in')
    }
  }

  const solicitarCheckout = async (ch) => {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'checkout_freela',
        freelaCheckoutHora: serverTimestamp()
      })
      toast.success('Checkout solicitado ao contratante')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao solicitar checkout')
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-emerald-700 text-center mb-4">Minhas Chamadas</h1>

      {chamadas.map((ch) => {
        // supondo que você armazene a localização do estabelecimento como:
        // ch.estabelecimentoGeo = { latitude, longitude }
        const distancia = useMemo(() => {
          if (!pos || !ch?.estabelecimentoGeo?.latitude) return null
          return Math.round(
            haversineMeters(
              pos.lat,
              pos.lng,
              ch.estabelecimentoGeo.latitude,
              ch.estabelecimentoGeo.longitude
            )
          )
        }, [pos, ch?.estabelecimentoGeo])

        const podeCheckIn =
          (ch.status === 'pago' || ch.status === 'confirmada') &&
          (distancia == null || distancia <= 150) // tolerância 150m

        return (
          <div key={ch.id} className="bg-white shadow rounded-xl p-4 mb-4 border border-emerald-300">
            <h2 className="text-lg font-semibold text-emerald-700">Chamada #{ch.id.slice(-5)}</h2>
            <p><strong>Status:</strong> {ch.status}</p>
            <p><strong>Valor diária:</strong> R$ {ch.valorDiaria?.toFixed(2) || '---'}</p>

            {/* endereço liberado após pagamento */}
            {ch.status !== 'aceita' && ch.enderecoEstabelecimento && (
              <p className="mt-1"><strong>📍 Endereço:</strong> {ch.enderecoEstabelecimento}</p>
            )}

            {/* distância/mapa simples */}
            {distancia != null && (
              <p className="text-sm text-gray-600 mt-1">
                Distância até o local: {distancia} m {distancia <= 150 ? '(ok para check-in)' : '(muito longe)'}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              {podeCheckIn && (
                <button
                  onClick={() => fazerCheckIn(ch)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  📍 Fazer Check-in
                </button>
              )}

              {ch.status === 'em_andamento' && (
                <button
                  onClick={() => solicitarCheckout(ch)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Solicitar Check-out
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
