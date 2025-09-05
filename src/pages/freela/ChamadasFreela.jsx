import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useChamadasDoFreela } from '@/hooks/useChamadasStream'
import { CHAMADA_STATUS } from '@/constants/chamadaStatus'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useChamadaFlags } from '@/hooks/useChamadaFlags'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const { chamadas, loading } = useChamadasDoFreela(usuario?.uid, [
    CHAMADA_STATUS.PENDENTE,
    CHAMADA_STATUS.ACEITA,
    CHAMADA_STATUS.CONFIRMADA,
    CHAMADA_STATUS.CHECKIN_FREELA,
    CHAMADA_STATUS.EM_ANDAMENTO,
    CHAMADA_STATUS.CHECKOUT_FREELA,
    CHAMADA_STATUS.CONCLUIDO,
    'pago',
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
        chamadas.map((ch) => <ChamadaItem key={ch.id} ch={ch} />)
      )}
    </div>
  )
}

function ChamadaItem({ ch }) {
  const {
    podeVerEndereco,
    podeCheckinFreela,
    podeCheckoutFreela,
    aguardandoPix,
  } = useChamadaFlags(ch.id)

  async function fazerCheckin() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        checkinFreela: true,
        checkinFreelaEm: serverTimestamp(),
        status: ch.status === 'pago' ? 'em_andamento' : (ch.status || 'em_andamento'),
      })
      toast.success('Check-in realizado!')
    } catch (e) {
      console.error(e)
      toast.error('Falha ao fazer check-in.')
    }
  }

  async function fazerCheckout() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        checkoutFreela: true,
        checkoutFreelaEm: serverTimestamp(),
        status: 'checkout_freela',
      })
      toast.success('Check-out realizado!')
    } catch (e) {
      console.error(e)
      toast.error('Falha ao fazer check-out.')
    }
  }

  async function cancelarChamada() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'cancelada pelo freela',
        canceladaPor: 'freela',
        canceladaEm: serverTimestamp(),
      })
      toast.success('❌ Chamada cancelada.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao cancelar chamada.')
    }
  }

  return (
    <div className="bg-white border rounded-xl p-4 mb-4 space-y-2 shadow">
      <h2 className="font-semibold text-orange-600">Chamada #{String(ch.id).slice(-5)}</h2>
      <p><strong>Status:</strong> {ch.status}</p>
      {typeof ch.valorDiaria === 'number' && (
        <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
      )}
      {ch.observacao && <p className="text-sm text-gray-700">📝 {ch.observacao}</p>}

      {podeVerEndereco && ch.coordenadasContratante ? (
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
      ) : aguardandoPix ? (
        <div className="text-sm p-2 rounded bg-yellow-50">
          Aguardando confirmação do pagamento…
        </div>
      ) : (
        <div className="text-sm p-2 rounded bg-gray-100">
          Endereço será liberado após confirmação de pagamento.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <button
          onClick={fazerCheckin}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={!podeCheckinFreela}
        >
          📍 Fazer Check-in
        </button>
        <button
          onClick={fazerCheckout}
          className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          disabled={!podeCheckoutFreela}
        >
          ⏳ Fazer Check-out
        </button>
        {/* Cancelar: sempre disponível */}
        <button
          onClick={cancelarChamada}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          ❌ Cancelar
        </button>
      </div>

      <RespostasRapidasFreela chamadaId={ch.id} />

      {(ch.status === 'concluido' || ch.status === 'finalizada') && (
        <span className="text-green-600 font-bold block text-center">
          ✅ Finalizada
        </span>
      )}
    </div>
  )
}
