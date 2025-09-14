import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useChamadasDoFreela } from '@/hooks/useChamadasStream'
import { CHAMADA_STATUS } from '@/constants/chamadaStatus'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const { chamadas, loading } = useChamadasDoFreela(usuario?.uid, [
    CHAMADA_STATUS.PENDENTE,
    CHAMADA_STATUS.ACEITA,
    CHAMADA_STATUS.CONFIRMADA,
    CHAMADA_STATUS.CHECKIN_FREELA,
    CHAMADA_STATUS.EM_ANDAMENTO,
    CHAMADA_STATUS.CHECKOUT_FREELA,    
    'pago',
    'concluido'
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
  const { usuario } = useAuth()
  const [enderecoContratante, setEnderecoContratante] = useState(ch.endereco || null)
  const [statusPagamento, setStatusPagamento] = useState(null)

  // 🔎 Escuta o doc de pagamento
  useEffect(() => {
    const ref = doc(db, 'pagamentos_usuarios', ch.id)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setStatusPagamento(snap.data().status)
      }
    })
    return () => unsub()
  }, [ch.id])

  // ✅ statusEfetivo respeita prioridade
  let statusEfetivo = ch.status
  if (statusEfetivo === 'aceita' && statusPagamento === 'pago') {
    statusEfetivo = 'pago'
  }

  // 🔎 Busca endereço do contratante
  useEffect(() => {
    async function carregarEndereco() {
      if (!enderecoContratante && ch.contratanteUid) {
        try {
          const snap = await getDoc(doc(db, 'usuarios', ch.contratanteUid))
          if (snap.exists()) {
            setEnderecoContratante(snap.data().endereco || null)
          }
        } catch (e) {
          console.error('[ChamadasFreela] Erro ao buscar endereço do contratante:', e)
        }
      }
    }
    carregarEndereco()
  }, [ch.contratanteUid, enderecoContratante])

  async function aceitarChamada() {
    const ref = doc(db, 'chamadas', ch.id)
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Chamada não existe mais.')
        const atual = snap.data()
        const statusAtual = String(atual.status || '').toLowerCase()

        if (statusAtual !== 'pendente') {
          throw new Error('Essa chamada já foi aceita ou não está mais disponível.')
        }

        tx.update(ref, {
          status: 'aceita',
          freelaUid: usuario?.uid || atual.freelaUid || null,
          freelaNome: usuario?.nome || atual.freelaNome || null,
          aceitaEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        })
      })
      toast.success('✅ Chamada aceita! Aguarde o pagamento do contratante.')
    } catch (e) {
      console.error('[aceitarChamada]', e)
      toast.error(e?.message || 'Não foi possível aceitar a chamada.')
    }
  }

  async function fazerCheckin() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        checkinFreela: true,
        checkinFreelaEm: serverTimestamp(),
        status: 'checkin_freela',
        atualizadoEm: serverTimestamp(),
        freelaCoordenadas: usuario?.coordenadas || null,
      })
      toast.success('📍 Check-in realizado!')
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
        atualizadoEm: serverTimestamp(),
      })
      toast.success('⏳ Check-out realizado!')
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
        atualizadoEm: serverTimestamp(),
      })
      toast.success('❌ Chamada cancelada.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao cancelar chamada.')
    }
  }

  return (
    <div className="bg-white border rounded-xl p-4 mb-4 space-y-2 shadow">
      <h2 className="font-semibold text-orange-600">
        Chamada #{String(ch.id).slice(-5)}
      </h2>
      <p><strong>Status:</strong> {statusEfetivo}</p>
      {typeof ch.valorDiaria === 'number' && (
        <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
      )}
      {ch.observacao && <p className="text-sm text-gray-700">📝 {ch.observacao}</p>}

      {/* Mapa / endereço condicionado ao pagamento */}
      {statusEfetivo === 'pago' && ch.coordenadasContratante ? (
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
      ) : statusEfetivo === 'pago' ? (
        <div className="text-sm p-2 rounded bg-yellow-50">
          Aguardando liberação do endereço…
        </div>
      ) : (
        <div className="text-sm p-2 rounded bg-gray-100">
          Endereço será liberado após confirmação de pagamento.
        </div>
      )}

      {statusEfetivo === 'pago' && enderecoContratante && (
        <div className="mt-3 p-2 bg-green-100 rounded text-green-700 text-center text-sm">
          📍 Endereço: {enderecoContratante}
          <p className="text-xs mt-1">
            Procure o responsável no local para confirmar seu check-in.
          </p>
        </div>
      )}

      {/* Ações do Freela */}
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        {statusEfetivo === 'pendente' && (
          <button
            onClick={aceitarChamada}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            ✅ Aceitar chamada
          </button>
        )}

        <button
          onClick={fazerCheckin}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={statusEfetivo !== 'pago'}
        >
          📍 Fazer Check-in
        </button>

        <button
          onClick={fazerCheckout}
          className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          disabled={statusEfetivo !== 'em_andamento'}
        >
          ⏳ Fazer Check-out
        </button>

        <button
          onClick={cancelarChamada}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          ❌ Cancelar
        </button>
      </div>

      <RespostasRapidasFreela chamadaId={ch.id} />

      {/* Avaliação do contratante */}
      {statusEfetivo === 'concluido' && !ch.avaliadoPorFreela && (
        <AvaliacaoFreela chamada={ch} />
      )}

      {(statusEfetivo === 'concluido' || statusEfetivo === 'finalizada') && (
        <span className="text-green-600 font-bold block text-center">
          ✅ Finalizada
        </span>
      )}
    </div>
  )
}
