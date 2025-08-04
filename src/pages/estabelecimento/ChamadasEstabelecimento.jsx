// ChamadasEstabelecimento.jsx com QR Code e código Pix

import React, { useEffect, useState } from 'react' import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore' import { db } from '@/firebase' import AvaliacaoInline from '@/components/AvaliacaoInline' import MensagensRecebidasEstabelecimento from '@/components/MensagensRecebidasEstabelecimento' import { toast } from 'react-hot-toast'

export default function ChamadasEstabelecimento({ estabelecimento }) { const [chamadas, setChamadas] = useState([])

useEffect(() => { if (!estabelecimento?.uid) return

const q = query(
  collection(db, 'chamadas'),
  where('estabelecimentoUid', '==', estabelecimento.uid),
  where('status', 'in', [
    'pendente',
    'aceita',
    'pago',
    'checkin_freela',
    'checkout_freela',
    'concluido'
  ])
)

const unsub = onSnapshot(q, (snap) => {
  const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  setChamadas(lista)
})

return () => unsub()

}, [estabelecimento])

const copiarCodigoPix = (codigo) => { navigator.clipboard.writeText(codigo) toast.success('Código Pix copiado!') }

const atualizarChamada = async (id, dados) => { try { await updateDoc(doc(db, 'chamadas', id), dados) toast.success('✅ Ação realizada com sucesso!') } catch (err) { console.error('Erro ao atualizar chamada:', err) toast.error('Erro ao atualizar chamada.') } }

if (!chamadas.length) return <p className="text-center text-gray-500">Nenhuma chamada encontrada.</p>

return ( <div className="space-y-4"> {chamadas.map((chamada) => ( <div key={chamada.id} className="bg-white border border-orange-200 rounded-xl shadow p-4 space-y-2"> <h2 className="font-semibold text-orange-600">Freela: {chamada.freelaNome || '---'}</h2> <p>Status: <span className="font-medium text-gray-800">{chamada.status}</span></p>

{chamada.observacao && (
        <p className="text-sm text-gray-700"><strong>Obs:</strong> {chamada.observacao}</p>
      )}

      <MensagensRecebidasEstabelecimento chamadaId={chamada.id} />

      {/* QR Code e código Pix */}
      {chamada.status === 'aceita' && chamada.imagemQrcode && (
        <div className="bg-gray-50 border border-gray-200 p-3 rounded-md text-center">
          <img src={chamada.imagemQrcode} alt="QR Code Pix" className="mx-auto w-40 h-40 mb-2" />
          {chamada.brCode && (
            <div>
              <p className="text-xs break-words text-gray-600 mb-2">{chamada.brCode}</p>
              <button
                onClick={() => copiarCodigoPix(chamada.brCode)}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
              >
                📋 Copiar código Pix
              </button>
            </div>
          )}
        </div>
      )}

      {/* Botões de progresso */}
      {chamada.status === 'checkin_freela' && !chamada.checkInEstabelecimento && (
        <button
          onClick={() => atualizarChamada(chamada.id, {
            checkInEstabelecimento: true,
            checkInEstabelecimentoHora: serverTimestamp(),
            status: 'em_andamento'
          })}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
        >
          ✅ Confirmar Check-in
        </button>
      )}

      {chamada.status === 'checkout_freela' && !chamada.checkOutEstabelecimento && (
        <button
          onClick={() => atualizarChamada(chamada.id, {
            checkOutEstabelecimento: true,
            checkOutEstabelecimentoHora: serverTimestamp(),
            status: 'concluido'
          })}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          📤 Confirmar Check-out
        </button>
      )}

      {/* Avaliação */}
      {chamada.status === 'concluido' && (
        <AvaliacaoInline chamada={chamada} tipo="estabelecimento" />
      )}
    </div>
  ))}
</div>

) }

