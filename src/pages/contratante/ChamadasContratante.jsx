import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useChamadasDoContratante } from '@/hooks/useChamadasStream'
import { CHAMADA_STATUS } from '@/constants/chamadaStatus'
import { usePagamentoPosAceite } from '@/hooks/usePagamentoPosAceite'
import {
  confirmarCheckInFreelaPeloContratante,
  confirmarCheckOutFreelaPeloContratante,
} from '@/services/chamadasService'
import MensagensRecebidasContratante from '@/components/MensagensRecebidasContratante'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function ChamadasContratanteV2() {
  const { usuario } = useAuth()
  const { chamadas, loading } = useChamadasDoContratante(usuario?.uid, [
    CHAMADA_STATUS.PENDENTE,
    CHAMADA_STATUS.AGUARDANDO_ACEITE,
    CHAMADA_STATUS.ACEITA,
    CHAMADA_STATUS.CONFIRMADA,
    CHAMADA_STATUS.CHECKIN_FREELA,
    CHAMADA_STATUS.EM_ANDAMENTO,
    CHAMADA_STATUS.CHECKOUT_FREELA,
    CHAMADA_STATUS.CONCLUIDO,
  ])
  const { pagarCartaoAposAceite, gerarPixAposAceite } = usePagamentoPosAceite()

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📡 Chamadas Ativas (V2)
      </h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa.</p>
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

            {/* 📍 Mapa com local do contratante e do check-in do freela */}
            {ch.coordenadasContratante && (
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
                {ch.coordenadasCheckInFreela && (
                  <Marker position={[ch.coordenadasCheckInFreela.latitude, ch.coordenadasCheckInFreela.longitude]} />
                )}
              </MapContainer>
            )}

            {/* 💬 mensagens rápidas */}
            <MensagensRecebidasContratante chamadaId={ch.id} />

            {/* 💳 pagamento pós-aceite */}
            {ch.status === 'aceita' && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={() => pagarCartaoAposAceite(ch)}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  💳 Liberar pagamento (Cartão)
                </button>
                <button
                  onClick={() => gerarPixAposAceite(ch)}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  💸 Liberar pagamento (Pix)
                </button>
              </div>
            )}

            {/* QR Pix aguardando pagamento */}
            {ch.pagamento?.metodo === 'pix' && ch.pagamento?.status === 'aguardando_pix' && (
              <div className="bg-gray-50 border rounded p-2 text-center">
                <p className="text-green-700 font-semibold">📲 Pague o Pix para liberar o endereço</p>
                {ch.pagamento.qrCodePix && (
                  <img src={ch.pagamento.qrCodePix} alt="QR Pix" className="mx-auto w-40 my-2" />
                )}
                {ch.pagamento.copiaColaPix && (
                  <p className="text-xs break-all">{ch.pagamento.copiaColaPix}</p>
                )}
              </div>
            )}

            {/* 📍 Check-in */}
            {ch.status === CHAMADA_STATUS.CHECKIN_FREELA && (
              <button
                onClick={() => confirmarCheckInFreelaPeloContratante(ch)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                📍 Confirmar Check-in
              </button>
            )}

            {/* ⏳ Check-out */}
            {ch.status === CHAMADA_STATUS.CHECKOUT_FREELA && (
              <button
                onClick={() => confirmarCheckOutFreelaPeloContratante(ch)}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
              >
                ⏳ Confirmar Check-out
              </button>
            )}

            {/* ⭐ Avaliação */}
            {ch.status === 'concluido' && !ch.avaliadoPeloContratante && (
              <AvaliacaoContratante chamada={ch} />
            )}

            {/* ✅ Finalizada */}
            {(ch.status === 'concluido') && (
              <p className="text-green-600 font-bold text-center">✅ Finalizada</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}