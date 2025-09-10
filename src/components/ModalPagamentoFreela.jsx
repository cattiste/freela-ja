import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import QRCode from 'react-qr-code';

export default function ModalPagamentoFreela({ chamada, onClose }) {
  const [pagamento, setPagamento] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [pixGerado, setPixGerado] = useState(false);

  // Escuta atualizações no Firestore
  useEffect(() => {
    if (!chamada?.id) return;

    const unsub = onSnapshot(doc(db, 'chamadas', chamada.id), (snap) => {
      const data = snap.data();
      setPagamento(data?.pagamento || null);

      if (
        data?.pagamento?.status === 'pendente' &&
        (data?.pagamento?.copiaCola || data?.pagamento?.qrCode?.qrcode)
      ) {
        setPixGerado(true);
      }
    });

    return () => unsub();
  }, [chamada?.id]);

  // Gera Pix automaticamente ao abrir o modal
  useEffect(() => {
    const gerarPix = async () => {
      if (!chamada?.id || pixGerado) return;

      try {
        setCarregando(true);

        const response = await fetch(
          'https://api-kbaliknhja-rj.a.run.app/pix/cobrar',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chamadaId: chamada.id,
              valor: chamada?.valorDiaria || chamada?.valor || 1, // usa valor da diária
            }),
          }
        );

        const data = await response.json();
        console.log('📡 Resposta da API Pix:', data);

        if (data?.copiaCola || data?.qrCode?.qrcode) {
          setPixGerado(true);
        } else {
          throw new Error('Dados de Pix não retornados corretamente.');
        }
      } catch (err) {
        console.error('❌ Erro ao gerar Pix:', err);
        alert('Erro ao gerar Pix. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    };

    gerarPix();
  }, [chamada?.id, pixGerado]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-orange-600 mb-4 text-center">
          Pagamento via Pix
        </h2>

        {!pixGerado ? (
          <p className="text-center text-gray-600">
            {carregando ? 'Gerando Pix...' : 'Preparando pagamento...'}
          </p>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              {pagamento?.imagemQrcode ? (
                <img
                  src={pagamento.imagemQrcode}
                  alt="QR Code Pix"
                  className="w-48 h-48"
                />
              ) : (
                <QRCode
                  value={
                    pagamento?.copiaCola ||
                    pagamento?.qrCode?.qrcode ||
                    ''
                  }
                  size={192}
                />
              )}
            </div>

            <p className="text-center text-sm mb-2">
              📎 Copie o código abaixo e pague via seu app bancário:
            </p>

            <textarea
              readOnly
              value={
                pagamento?.copiaCola ||
                pagamento?.qrCode?.qrcode ||
                ''
              }
              className="w-full text-sm border p-2 rounded bg-gray-100"
              rows={3}
              onFocus={(e) => e.target.select()}
            />

            <p className="text-center text-green-600 font-bold mt-4">
              Aguardando pagamento...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
