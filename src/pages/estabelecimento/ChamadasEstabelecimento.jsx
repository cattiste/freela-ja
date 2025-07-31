import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'
import AvaliacaoInline from '@/components/AvaliacaoInline'
import ChatInline from '@/components/ChatInline'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [loadingId, setLoadingId] = useState(null)
  const [pagamentos, setPagamentos] = useState({})
  const [qrcodes, setQrcodes] = useState({})

  useEffect(() => {
    console.log('🧪 Estabelecimento carregado:', estabelecimento?.uid)
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid)
      // Se quiser voltar a filtrar, reative o status aqui
      // where('status', 'in', ['aceita', 'checkin_freela', 'em_andamento', 'checkout_freela', 'concluido', 'finalizada'])
    )

    const unsub = onSnapshot(q, async (snap) => {
      const lista = []
      const pagamentosTemp = {}

      for (const docSnap of snap.docs) {
        const chamada = { id: docSnap.id, ...docSnap.data() }
        console.log('📦 Chamada encontrada:', chamada)
        lista.push(chamada)

        const pgSnap = await getDoc(doc(db, 'pagamentos', chamada.id))
        if (pgSnap.exists()) pagamentosTemp[chamada.id] = pgSnap.data()
      }

      setChamadas(lista)
      setPagamentos(pagamentosTemp)
      setCarregando(false)
    })

    return () => unsub()
  }, [estabelecimento])

  const pagarChamada = async (chamada) => {
    try {
      const res = await fetch('https://us-central1-freelaja-web-50254.cloudfunctions.net/api/cobraChamadaAoAceitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chamadaId: chamada.id,
          valorDiaria: chamada.valorDiaria,
          nomeEstabelecimento: estabelecimento.nome,
          cpfEstabelecimento: estabelecimento.cpf
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('✅ Cobrança Pix gerada com sucesso!')
        setQrcodes(prev => ({ ...prev, [chamada.id]: data.imagem }))
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar cobrança Pix')
    }
  }

  const atualizarChamada = async (id, dados) => {
    try {
      setLoadingId(id)
      await updateDoc(doc(db, 'chamadas', id), dados)
      toast.success('✅ Ação realizada com sucesso!')
    } catch (err) {
      console.error('Erro ao atualizar chamada:', err)
      toast.error('Erro ao atualizar chamada.')
    } finally {
      setLoadingId(null)
    }
  }

  const badgeStatus = (status) => {
    const cores = {
      aceita: 'bg-yellow-200 text-yellow-700',
      checkin_freela: 'bg-purple-200 text-purple-700',
      em_andamento: 'bg-green-200 text-green-700',
      checkout_freela: 'bg-blue-200 text-blue-700',
      concluido: 'bg-green-100 text-green-600',
      finalizada: 'bg-gray-200 text-gray-600'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cores[status] || 'bg-gray-200 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (carregando) return <p className="text-center text-orange-600">🔄 Carregando chamadas...</p>
  if (!carregando && chamadas.length === 0)
    return <p className="text-center text-gray-600">📭 Nenhuma chamada registrada.</p>

  return (
    <div className="space-y-3">
      {chamadas.map(chamada => {
        const pg = pagamentos[chamada.id]
        const qr = qrcodes[chamada.id]

        return (
          <div key={chamada.id} className="p-3 bg-white rounded-xl shadow border border-orange-100 space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={chamada.freelaFoto || 'https://placehold.co/100x100'}
                alt={chamada.freelaNome}
                className="w-10 h-10 rounded-full border border-orange-300 object-cover"
              />
              <div className="flex-1">
                <p className="font-bold text-orange-600">{chamada.freelaNome}</p>
                {chamada.valorDiaria && (
                  <p className="text-xs text-gray-500">💰 R$ {chamada.valorDiaria} / diária</p>
                )}
                <p className="text-sm mt-1">📌 Status: {badgeStatus(chamada.status)}</p>
                <ChatInline chamadaId={chamada.id} />
              </div>
            </div>

            <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-wrap">
checkInFreela: {chamada.checkInFreela?.toString()} | checkInEstabelecimento: {chamada.checkInEstabelecimento?.toString()} |
checkOutFreela: {chamada.checkOutFreela?.toString()} | checkOutEstabelecimento: {chamada.checkOutEstabelecimento?.toString()}
            </pre>

            {(!pg || !pg.txid) && chamada.status === 'aceita' && (
              <button
                onClick={() => pagarChamada(chamada)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💳 Efetuar Pagamento Pix
              </button>
            )}

            {qr && (
              <div className="mt-3">
                <img src={qr} alt="QR Code Pix" className="w-48 mx-auto" />
                <p className="text-center text-sm text-gray-500 mt-1">Escaneie para pagar</p>
              </div>
            )}

            {pg?.pixConfirmado && (
              <p className="text-green-700 font-semibold text-sm text-center">✅ Pagamento confirmado</p>
            )}

            {chamada.status === 'checkin_freela' && !chamada.checkInEstabelecimento && (
              <button
                onClick={() => atualizarChamada(chamada.id, {
                  checkInEstabelecimento: true,
                  checkInEstabelecimentoHora: serverTimestamp(),
                  status: 'em_andamento'
                })}
                disabled={loadingId === chamada.id}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar Check-in'}
              </button>
            )}

            {chamada.status === 'checkout_freela' && !chamada.checkOutEstabelecimento && (
              <button
                onClick={() => atualizarChamada(chamada.id, {
                  checkOutEstabelecimento: true,
                  checkOutEstabelecimentoHora: serverTimestamp(),
                  status: 'concluido'
                })}
                disabled={loadingId === chamada.id}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '📤 Confirmar Check-out'}
              </button>
            )}

            {chamada.status === 'concluido' && pg && !pg.pixConfirmado && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('https://us-central1-freelaja-web-50254.cloudfunctions.net/api/pagarFreelaAoCheckout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ chamadaId: chamada.id })
                    })
                    const data = await res.json()
                    if (res.ok) {
                      toast.success('✅ Freela pago com sucesso!')
                      setPagamentos(prev => ({
                        ...prev,
                        [chamada.id]: { ...pg, pixConfirmado: true }
                      }))
                    } else {
                      throw new Error(data.error || 'Erro desconhecido')
                    }
                  } catch (err) {
                    console.error(err)
                    toast.error('Erro ao pagar freela.')
                  }
                }}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                💸 Pagar Freela
              </button>
            )}

            {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
              <>
                <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
                {!chamada.avaliacaoFreelaFeita ? (
                  <AvaliacaoInline chamada={chamada} tipo="estabelecimento" />
                ) : (
                  <p className="text-sm text-gray-500 text-center">Freelancer já avaliado ✅</p>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
