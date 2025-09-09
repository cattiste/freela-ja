import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function ModalPagamentoFreela({ chamada, onClose }) {
  const [status, setStatus] = useState('pendente');
  const [pagamento, setPagamento] = useState(null);
  const [loading, setLoading] = useState(false);

  const gerarPix = async () => {
    try {
      setLoading(true);
      setStatus('pendente');

      const response = await fetch(
        'https://api-kbaliknhja-rj.a.run.app/api/pix/cobrar',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chamadaId: chamada.id }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar cobrança Pix');
      }

      const data = await response.json();

      // salvar no state para exibir no modal
      setPagamento({
        txid: data.txid,
        copiaCola: data.qrcode || data.copiaCola,
        imagemQrcode: data.imagemQrcode,
      });

      // atualizar Firestore também
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        pagamento: {
          txid: data.txid,
          copiaCola: data.qrcode || data.copiaCola,
          imagemQrcode: data.imagemQrcode,
          status: 'pendente',
          criadoEm: new Date(),
        },
      });

      setStatus('gerado');
    } catch (error) {
      console.error('Erro ao gerar Pix:', error);
      setStatus('erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center text-orange-700 mb-4">
          Pagamento via Pix
        </h2>

        {status === 'pendente' && !pagamento && (
          <div className="text-center">
            <p>Aguardando geração do Pix...</p>
            <button
              onClick={gerarPix}
              className="mt-4 bg-orange-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Gerando...' : 'Gerar Pix'}
            </button>
          </div>
        )}

        {status === 'gerado' && pagamento && (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-3">
              Pix gerado com sucesso!
            </p>

            {pagamento.imagemQrcode && (
              <div className="flex flex-col items-center mb-4">
                <img
                  src={pagamento.imagemQrcode}
                  alt="QR Code Pix"
                  className="w-64 h-64"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Escaneie o QR Code acima para pagar
                </p>
              </div>
            )}

            {pagamento.copiaCola && (
              <div className="mt-2">
                <p className="font-medium mb-1">Pix Copia e Cola:</p>
                <textarea
                  readOnly
                  className="w-full p-2 border rounded text-sm"
                  rows={3}
                  value={pagamento.copiaCola}
                />
                <button
                  className="mt-2 bg-orange-600 text-white px-3 py-1 rounded"
                  onClick={() =>
                    navigator.clipboard.writeText(pagamento.copiaCola)
                  }
                >
                  Copiar
                </button>
              </div>
            )}
          </div>
        )}

        {status === 'erro' && (
          <p className="text-center text-red-600 mt-3">
            ❌ Erro ao gerar Pix. Tente novamente.
          </p>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
