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
import AvaliacaoInline from '@/components/AvaliacaoInline'

export default function ChamadasAtivas({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loadingId, setLoadingId] = useState(null)
  const [qrcodes, setQrcodes] = useState({})
  const [cpfManual, setCpfManual] = useState({})
  const [confirmarDados, setConfirmarDados] = useState({})

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['aceita', 'checkin_freela', 'em_andamento', 'checkout_freela', 'concluido'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const todasChamadas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      const unicas = {}
      todasChamadas.forEach((chamada) => {
        const existente = unicas[chamada.freelaUid]
        const novaData = chamada.criadoEm?.toMillis?.() || 0
        const dataExistente = existente?.criadoEm?.toMillis?.() || 0

        if (!existente || novaData > dataExistente) {
          unicas[chamada.freelaUid] = chamada
        }
      })

      setChamadas(Object.values(unicas))
    })

    return () => unsub()
  }, [estabelecimento])

  const pagarChamada = async (chamada) => {
    const valorNumerico = Number(chamada.valorDiaria)
    const cnpjLimpo = estabelecimento.cnpj?.replace(/[^0-9]/g, '')
    const documentoManual = cpfManual[chamada.id]?.replace(/[^0-9]/g, '') || ''

    const payload = {
      chamadaId: chamada.id,
      valorDiaria: valorNumerico,
      nomeEstabelecimento: estabelecimento.nome,
      cpfEstabelecimento: estabelecimento.cpf,
      cnpjEstabelecimento: cnpjLimpo,
      cpfResponsavel: estabelecimento.cpfResponsavel,
      documentoManual
    }

    if (!payload.valorDiaria || !payload.nomeEstabelecimento || (!documentoManual && !payload.cpfEstabelecimento && !payload.cnpjEstabelecimento)) {
      toast.error('⚠️ Preencha um CPF ou CNPJ válido')
      return
    }

    try {
      const res = await fetch('https://us-central1-freelaja-web-50254.cloudfunctions.net/api/cobraChamadaAoAceitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      const ref = doc(db, 'chamadas', id)
      await updateDoc(ref, dados)
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
      concluido: 'bg-gray-200 text-gray-700'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cores[status] || 'bg-gray-200 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (!chamadas.length) {
    return <div className="text-center mt-6 text-gray-500">Nenhuma chamada ativa no momento.</div>
  }

  return (
    <div className="space-y-4">
      {chamadas.map((chamada) => {
        // ✅ Oculta chamadas já avaliadas pelo estabelecimento
        if (chamada.status === 'concluido' && chamada.avaliacaoFreela?.nota) {
          return null
        }

        const confirmar = confirmarDados[chamada.id] === true

        return (
          <div key={chamada.id} className="bg-white rounded-xl p-3 shadow border border-orange-100 space-y-2">
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
              </div>
            </div>

            <input
              type="text"
              placeholder="Digite CPF ou CNPJ para pagamento"
              value={cpfManual[chamada.id] || ''}
              onChange={(e) => setCpfManual(prev => ({ ...prev, [chamada.id]: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />

            {!confirmar && (
              <button
                onClick={() => setConfirmarDados(prev => ({ ...prev, [chamada.id]: true }))}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                🧾 Confirmar dados de pagamento
              </button>
            )}

            {confirmar && (
              <>
                <div className="bg-gray-50 border border-gray-200 p-2 rounded text-sm text-gray-700">
                  <p><strong>Estabelecimento:</strong> {estabelecimento.nome}</p>
                  {cpfManual[chamada.id] && (
                    <p><strong>Documento informado:</strong> {cpfManual[chamada.id]}</p>
                  )}
                  <p><strong>Valor da diária:</strong> <input type="text" value={chamada.valorDiaria} disabled className="w-full bg-transparent text-gray-700" /></p>
                </div>
                <button
                  onClick={() => pagarChamada(chamada)}
                  className="w-full mt-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
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

            {chamada.checkInFreela === true && !chamada.checkInEstabelecimento && (
              <button
                onClick={() =>
                  atualizarChamada(chamada.id, {
                    checkInEstabelecimento: true,
                    checkInEstabelecimentoHora: serverTimestamp(),
                    status: 'em_andamento'
                  })
                }
                disabled={loadingId === chamada.id}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar Check-in'}
              </button>
            )}

            {chamada.checkOutFreela === true && !chamada.checkOutEstabelecimento && (
              <button
                onClick={() =>
                  atualizarChamada(chamada.id, {
                    checkOutEstabelecimento: true,
                    checkOutEstabelecimentoHora: serverTimestamp(),
                    status: 'concluido'
                  })
                }
                disabled={loadingId === chamada.id}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingId === chamada.id ? 'Confirmando...' : '📤 Confirmar Check-out'}
              </button>
            )}

            {/* ✅ Exibe Avaliação se ainda não foi feita */}
            {chamada.status === 'concluido' && (
              <AvaliacaoInline chamada={chamada} tipo="estabelecimento" />
            )}
          </div>
        )
      })}
    </div>
  )
}
