// ChamadasFreelaV2.jsx
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useChamadasDoFreela } from '@/hooks/useChamadasStream'
import { CHAMADA_STATUS } from '@/constants/chamadaStatus'
import { marcarAceita } from '@/services/chamadasService'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function ChamadasFreelaV2() {
  const { usuario } = useAuth()
  const { chamadas, loading } = useChamadasDoFreela(usuario?.uid, [
    CHAMADA_STATUS.PENDENTE,
    CHAMADA_STATUS.ACEITA,
    CHAMADA_STATUS.CONFIRMADA,
    CHAMADA_STATUS.CHECKIN_FREELA,
    CHAMADA_STATUS.EM_ANDAMENTO,
    CHAMADA_STATUS.CHECKOUT_FREELA,
    CHAMADA_STATUS.CONCLUIDO
  ])

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📲 Minhas Chamadas (Freela)
      </h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada no momento.</p>
      ) : (
        chamadas.map((ch) => (
          <div key={ch.id} className="bg-white border rounded-xl p-4 mb-4 space-y-2 shadow">
            <h2 className="font-semibold text-orange-600">Chamada #{String(ch.id).slice(-5)}</h2>
            <p><strong>Status:</strong> {ch.status}</p>
            {typeof ch.valorDiaria === 'number' && (
              <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
            )}

            {ch.observacao && (
              <p className="text-sm text-gray-700">📝 {ch.observacao}</p>
            )}

            {ch.liberarEnderecoAoFreela && ch.coordenadasContratante && (
              <MapContainer
                center={[ch.coordenadasContratante.latitude, ch.coordenadasContratante.longitude]}
                zoom={17}
                scrollWheelZoom={false}
                style={{ height: 200, borderRadius: 8 }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[ch.coordenadasContratante.latitude, ch.coordenadasContratante.longitude]} />
              </MapContainer>
            )}

            {ch.status === CHAMADA_STATUS.PENDENTE && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => marcarAceita(ch)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  ✅ Aceitar chamada
                </button>
                <button
                  onClick={() => alert('Cancelar chamada')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  ❌ Cancelar chamada
                </button>
              </div>
            )}

            {ch.status === CHAMADA_STATUS.CONFIRMADA && (
              <button
                onClick={() => alert('Check-in')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                📍 Fazer Check-in
              </button>
            )}

            {ch.status === CHAMADA_STATUS.EM_ANDAMENTO && (
              <button
                onClick={() => alert('Check-out')}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
              >
                ⏳ Fazer Check-out
              </button>
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