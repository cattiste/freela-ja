// ✅ ChamadasFreela.jsx - fluxo completo restaurado com localização, pagamento, check-in, mensagens e mapa
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
import toast from 'react-hot-toast'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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
        'aceita', 'pago', 'checkin_confirmado',
        'em_andamento', 'checkout_freela', 'concluido'
      ])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = []
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [usuario?.uid])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoordenadas({ latitude, longitude })
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    )
  }, [])

  const fazerCheckIn = async (chamada) => {
    if (!coordenadas) return toast.error('Localização não disponível')

    const lat1 = coordenadas.latitude
    const lon1 = coordenadas.longitude
    const lat2 = chamada.local?.latitude
    const lon2 = chamada.local?.longitude

    const distancia = calcularDistancia(lat1, lon1, lat2, lon2)

    if (distancia > 0.015) {
      return toast.error('Você precisa estar no local para fazer check-in')
    }

    await updateDoc(doc(db, 'chamadas', chamada.id), {
      status: 'checkin_freela',
      ultimaLocalizacao: new window.firebase.firestore.GeoPoint(lat1, lon1),
      checkinHora: serverTimestamp(),
    })
    toast.success('Check-in realizado! Vá ao caixa confirmar.')
  }

  const fazerCheckOut = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'checkout_freela',
      checkoutHora: serverTimestamp(),
    })
    toast.success('Check-out realizado!')
  }

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // metros
    const toRad = x => (x * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // retorna em metros
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-center text-orange-600 mb-4">📲 Chamadas Recebidas</h1>
      {chamadas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma chamada ativa.</p>
      ) : (
        chamadas.map((chamada) => (
          <div key={chamada.id} className="bg-white border border-orange-300 p-4 rounded-xl shadow mb-4">
            <h2 className="text-lg font-semibold text-orange-700">Chamada #{chamada.id.slice(-5)}</h2>
            <p><strong>Status:</strong> {chamada.status}</p>
            <p><strong>Valor da diária:</strong> R$ {chamada.valorDiaria?.toFixed(2) || '--'}</p>
            {chamada.observacao && <p><strong>📄 Observação:</strong> {chamada.observacao}</p>}

            {chamada.status === 'pago' && chamada.local && coordenadas && (
              <div className="h-40 my-2">
                <MapContainer
                  center={[chamada.local.latitude, chamada.local.longitude]}
                  zoom={17}
                  scrollWheelZoom={false}
                  className="w-full h-full rounded-lg border"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker
                    position={[chamada.local.latitude, chamada.local.longitude]}
                    icon={L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32] })}
                  />
                </MapContainer>
              </div>
            )}

            {chamada.status === 'pago' && coordenadas && (
              <button
                onClick={() => fazerCheckIn(chamada)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2 w-full"
              >
                Fazer Check-in
              </button>
            )}

            {chamada.status === 'checkin_confirmado' && (
              <>
                <p className="text-sm text-blue-700 mt-2">🔔 Confirme seu check-in no caixa ou com o responsável.</p>
                <button
                  onClick={() => fazerCheckOut(chamada.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-2 w-full"
                >
                  Fazer Check-out
                </button>
              </>
            )}

            {/* 📩 Respostas Rapidas */}
            <RespostasRapidasFreela chamadaId={chamada.id} />

            {/* 📍 Endereço e botões externos */}
            {chamada.status === 'pago' && chamada.endereco && (
              <div className="mt-2 text-sm">
                <p><strong>Endereço:</strong> {chamada.endereco}</p>
                <div className="flex gap-2 mt-2">
                  <a href={`https://waze.com/ul?ll=${chamada.local.latitude},${chamada.local.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Abrir no Waze</a>
                  <a href={`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${chamada.local.latitude}&dropoff[longitude]=${chamada.local.longitude}`} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">Chamar Uber</a>
                  <a href={`https://99app.com/maps?dest=${chamada.local.latitude},${chamada.local.longitude}`} target="_blank" rel="noopener noreferrer" className="text-yellow-600 underline">Chamar 99</a>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
