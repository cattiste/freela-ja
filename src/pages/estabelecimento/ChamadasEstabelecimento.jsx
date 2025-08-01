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
import { toast } from 'react-hot-toast'
import ChatInline from '@/components/ChatInline'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [loadingId, setLoadingId] = useState(null)
  const [qrcodes, setQrcodes] = useState({})

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['aceita', 'checkin_freela', 'em_andamento', 'checkout_freela'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
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
        toast.success('✅ Pix gerado com sucesso!')
        setQrcodes(prev => ({ ...prev, [chamada.id]: data.imagem }))
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar Pix')
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

  if (carregando) return <p className="text-center text-orange-600">🔄 Carregando chamadas...</p>
  if (chamadas.length === 0) return <p className="text-center text-gray-600">📭 Nenhuma chamada registrada.</p>

  return (
    <div className="space-y-3">
      {chamadas.map(chamada => (
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
              <p className="text-sm mt-1 text-gray-600">Status: {chamada.status}</p>
              <ChatInline chamadaId={chamada.id} />
            </div>
          </div>

          <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-wrap">
checkInFreela: {chamada.checkInFreela?.toString()} | checkInEstabelecimento: {chamada.checkInEstabelecimento?.toString()} |
checkOutFreela: {chamada.checkOutFreela?.toString()} | checkOutEstabelecimento: {chamada.checkOutEstabelecimento?.toString()}
          </pre>

          {/* Botão de pagamento Pix */}
          {chamada.status === 'aceita' && (
            <>
              <button
                onClick={() => pagarChamada(chamada)}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                💳 Efetuar Pagamento Pix
              </button>
              {qrcodes[chamada.id] && (
                <div className="mt-2 text-center">
                  <img src={qrcodes[chamada.id]} alt="QR Code Pix" className="w-48 mx-auto" />
                  <p className="text-xs text-gray-500">Escaneie para pagar</p>
                </div>
              )}
            </>
          )}

          {/* Confirmar Check-in */}
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

          {/* Confirmar Check-out */}
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
        </div>
      ))}
    </div>
  )
}
