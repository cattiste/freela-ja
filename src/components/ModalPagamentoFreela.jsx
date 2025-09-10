import React, { useEffect, useState, useCallback } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import QRCode from 'react-qr-code'

export default function ModalPagamentoFreela({ freela, pagamentoDocId, onClose }) {
  const [pagamento, setPagamento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [pixGerado, setPixGerado] = useState(false)
  const [nomePagador, setNomePagador] = useState('')
  const [docPagador, setDocPagador] = useState('')

  const gerarPix = useCallback(async () => {
    if (pixGerado || !nomePagador || !docPagador) return

    try {
      const response = await fetch('https://api-kbaliknhja-rj.a.run.app/pix/cobrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chamadaId: pagamentoDocId,
            nome: nomePagador,
            cpfOuCnpj: docPagador
          }),
        }
      )

      const result = await response.json()

      if (result.txid) {
        console.log('✅ PIX gerado:', result)
        setPixGerado(true)
      } else {
        console.error('❌ Erro ao gerar PIX:', result)
      }
    } catch (err) {
      console.error('❌ Erro de rede ao gerar PIX:', err)
    }
  }, [pagamentoDocId, pixGerado, nomePagador, docPagador])

  useEffect(() => {
    if (!pagamentoDocId) {
      setCarregando(false)
      return
    }

    const unsub = onSnapshot(doc(db, 'pagamentos_usuarios', pagamentoDocId), (snap) => {
      console.log('📩 Snapshot recebido:', snap.exists() ? snap.data() : 'Documento não existe')

      if (snap.exists()) {
        const dados = snap.data()
        setPagamento(dados)
        setCarregando(false)
      } else {
        setCarregando(false)
        console.error('❌ Documento de pagamento não encontrado:', pagamentoDocId)
      }
    })

    return () => unsub()
  }, [pagamentoDocId])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
        >✕</button>

        <h2 className="text-lg font-bold text-orange-700 mb-4 text-center">Pagamento via Pix</h2>

        {carregando ? (
          <p className="text-center text-gray-500">Carregando dados do pagamento...</p>
        ) : !pagamento ? (
          <p className="text-center text-red-500">Pagamento não encontrado.</p>
        ) : (
          <div className="space-y-4">
            {!pixGerado && (
              <>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Nome completo do pagador"
                  value={nomePagador}
                  onChange={(e) => setNomePagador(e.target.value)}
                />
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="CPF ou CNPJ do pagador"
                  value={docPagador}
                  onChange={(e) => setDocPagador(e.target.value)}
                />
                <button
                  onClick={gerarPix}
                  disabled={!nomePagador || !docPagador}
                  className="btn btn-primary w-full"
                >
                  Gerar Pix
                </button>
              </>
            )}

            {pagamento.qrCodePix || pagamento.qrCode ? (
              <div className="flex justify-center">
                <QRCode value={pagamento.qrCodePix || pagamento.qrCode} size={200} />
              </div>
            ) : (
              pixGerado && (
                <p className="text-center text-yellow-600">Aguardando geração do PIX...</p>
              )
            )}

            {pagamento.copiaColaPix || pagamento.pixCopiaECola ? (
              <div className="bg-gray-100 p-2 rounded-md text-sm text-center break-all">
                {pagamento.copiaColaPix || pagamento.pixCopiaECola}
              </div>
            ) : null}

            <div className="text-center text-sm text-gray-600">
              Status: <span className="font-bold text-orange-600">{pagamento.status}</span>
            </div>

            {pagamento.status === 'pago' && (
              <p className="text-green-600 text-center font-semibold">✅ Pagamento confirmado!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
