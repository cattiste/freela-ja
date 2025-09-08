// src/components/ModalPagamentoFreela.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import QRCode from 'react-qr-code'

export default function ModalPagamentoFreela({ freela, pagamentoDocId, onClose }) {
  const [pagamento, setPagamento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [pixGerado, setPixGerado] = useState(false)

  console.log('📦 Modal aberto para pagamentoDocId:', pagamentoDocId)
  console.log('🧑‍🍳 Freela:', freela)

  const gerarPix = useCallback(async () => {
    if (pixGerado) return

    try {
      const response = await fetch('https://southamerica-east1-freelaja-web-50254.cloudfunctions.net/api/pix/cobrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chamadaId: pagamentoDocId })
      })

      const result = await response.json()
      console.log('[Pix] Resultado da API:', result)

      if (result.ok) {
        setPixGerado(true)
      } else {
        console.error('[Pix] Erro ao gerar Pix:', result.erro || 'Erro desconhecido')
      }
    } catch (err) {
      console.error('[Pix] Erro de rede ao gerar Pix:', err)
    }
  }, [pagamentoDocId, pixGerado])

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

        if (!pixGerado && dados.status === 'pendente') {
          gerarPix()
        }

        setCarregando(false)
      } else {
        setCarregando(false)
        console.error('❌ Documento de pagamento não encontrado:', pagamentoDocId)
      }
    })

    return () => unsub()
  }, [pagamentoDocId, gerarPix, pixGerado])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
        >✕</button>

        <h2 className="text-lg font-bold text-orange-700 mb-2 text-center">Pagamento via Pix</h2>

        {carregando ? (
          <p className="text-center text-gray-500">Carregando dados do pagamento...</p>
        ) : !pagamento ? (
          <p className="text-center text-red-500">Pagamento não encontrado.</p>
        ) : (
          <div className="space-y-4">
            {pagamento.qrCodePix || pagamento.qrCode ? (
              <div className="flex justify-center">
                <QRCode value={pagamento.qrCodePix || pagamento.qrCode} size={200} />
              </div>
            ) : (
              <p className="text-center text-gray-500">QR Code indisponível.</p>
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

            {pagamento.status === 'pendente' && !pagamento.qrCodePix && (
              <p className="text-yellow-600 text-center">Aguardando geração do PIX...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
