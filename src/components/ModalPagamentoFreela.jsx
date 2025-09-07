// src/components/ModalPagamentoFreela.jsx
import React, { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import QRCode from 'react-qr-code'
import { verificarStatusPix } from '@/utils/verificarStatusPix'

export default function ModalPagamentoFreela({ freela, pagamentoDocId, onClose }) {
  const [pagamento, setPagamento] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // 🔁 Atualiza localmente quando Firestore mudar
  useEffect(() => {
    if (!pagamentoDocId) return

    const unsub = onSnapshot(doc(db, 'pagamentos_usuarios', pagamentoDocId), (snap) => {
      if (snap.exists()) {
        const dados = snap.data()
        setPagamento(dados)
        setCarregando(false)
      } else {
        setCarregando(false)
      }
    })

    return () => unsub()
  }, [pagamentoDocId])

  // 🔄 Verifica status do Pix a cada 5s (se ainda estiver "aguardando")
  useEffect(() => {
    if (!pagamento?.txid || pagamento?.status === 'pago') return

    const interval = setInterval(async () => {
      const res = await verificarStatusPix(pagamento.txid)
      if (res?.status === 'CONCLUIDA') {
        setPagamento((prev) => ({ ...prev, status: 'pago' }))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [pagamento])

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
            {pagamento.qrCode || pagamento.pixCopiaECola ? (
              <div className="flex justify-center">
                <QRCode
                  value={pagamento.qrCode || pagamento.pixCopiaECola}
                  size={200}
                />
              </div>
            ) : (
              <p className="text-center text-gray-500">QR Code indisponível.</p>
            )}

            {pagamento.copiaECola || pagamento.pixCopiaECola ? (
              <div className="bg-gray-100 p-2 rounded-md text-sm text-center break-all">
                {pagamento.copiaECola || pagamento.pixCopiaECola}
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
