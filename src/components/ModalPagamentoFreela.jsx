// src/components/ModalPagamentoFreela.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import QRCode from 'react-qr-code'

export default function ModalPagamentoFreela({ freela, pagamentoDocId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [pagamento, setPagamento] = useState(null)

  useEffect(() => {
    if (!pagamentoDocId) return

    const unsubscribe = setInterval(async () => {
      const docSnap = await getDoc(doc(db, 'pagamentos_usuarios', pagamentoDocId))
      const dados = docSnap.data()

      if (dados?.status === 'pago') {
        setPagamento(dados)
        setLoading(false)
        clearInterval(unsubscribe)
      } else if (dados) {
        setPagamento(dados)
        setLoading(false)
      }
    }, 3000)

    return () => clearInterval(unsubscribe)
  }, [pagamentoDocId])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-4 max-w-md w-full space-y-4 relative shadow-xl">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >✕</button>

        <h2 className="text-lg font-bold text-orange-600 text-center">Pagamento via Pix</h2>

        {loading && <p className="text-center text-gray-500">Carregando dados do pagamento...</p>}

        {erro && <p className="text-red-600 text-center">Erro: {erro}</p>}

        {pagamento && pagamento.status === 'pago' && (
          <p className="text-center text-green-600 font-bold">✅ Pagamento confirmado!</p>
        )}

        {pagamento && pagamento.status !== 'pago' && (
          <>
            {pagamento.qrCode && (
              <div className="flex justify-center">
                <QRCode value={pagamento.qrCode} size={180} />
              </div>
            )}
            <div className="bg-gray-100 p-2 text-xs rounded mt-2">
              <p className="font-bold text-orange-600 mb-1">Pix Copia e Cola:</p>
              <textarea
                readOnly
                value={pagamento.qrCodeCopiar || ''}
                className="w-full text-xs p-1 rounded border border-gray-300"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <p className="text-center text-gray-500 text-sm mt-2">
              Aguarde a confirmação automática após o pagamento.<br/>
              Isso pode levar até 1 minuto.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
