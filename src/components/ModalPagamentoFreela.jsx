// src/components/ModalPagamentoFreela.jsx
import React from 'react';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

// (Opcional) se já tiver Cloud Functions para gerar PIX, descomente abaixo e use no handler do PIX
// import { getFunctions, httpsCallable } from 'firebase/functions';

export default function ModalPagamentoFreela({
  freela,
  onClose,
  pagamentoDocId, // opcional: se você já souber o chamadaId, passe aqui
}) {
  if (!freela) return null;

  // Resolve o ID do documento em pagamentos_usuarios
  const resolveDocId = () =>
    pagamentoDocId || freela?.chamadaId || freela?.chamada_id || freela?.id;

  const { usuario } = useAuth();
  const contratanteUid = usuario?.uid || null;

  // ⚙️ upsert simples em pagamentos_usuarios/{docId}
  async function upsertPagamento(docId, data) {
    if (!docId) return; // sem docId? não falhe o fluxo visual
    const ref = doc(db, 'pagamentos_usuarios', String(docId));
    await setDoc(ref, { ...data, atualizadoEm: serverTimestamp() }, { merge: true });
  }

  // 💳 Pagar com Cartão (senha já cadastrada)
  async function onPagarComCartao() {
    try {
      const docId = resolveDocId();

      await upsertPagamento(docId, {
        metodo: 'cartao',
        status: 'aguardando_confirmacao', // aguardará confirmação com a senha salva
        contratanteUid, 
        freelaUid: freela?.uid || freela?.id || null,
        freelaNome: freela?.nome || '',
        valorDiaria: Number(freela?.valorDiaria || 0),
        valorContratante: Number(freela?.valorDiaria || 0) * 1.10, // 10% a mais
        valorFreela: Number(freela?.valorDiaria || 0) * 0.90,       // 10% a menos
        contratadoEm: serverTimestamp(),
      });

      toast.success('Pagamento por cartão iniciado. Confirme com sua senha.');
      onClose?.();
    } catch (e) {
      console.error('[ModalPagamentoFreela] cartao:', e);
      toast.error('Não foi possível iniciar o pagamento por cartão.');
    }
  }

  // 💸 Pagar via Pix (gera QR / Copia-e-Cola)
  async function onPagarViaPix() {
    try {
      const docId = resolveDocId();

      // 1) registra intenção de PIX
      await upsertPagamento(docId, {
        metodo: 'pix',
        status: 'pix_pendente',
        contratanteUid, 
        freelaUid: freela?.uid || freela?.id || null,
        freelaNome: freela?.nome || '',
        valorDiaria: Number(freela?.valorDiaria || 0),
        contratadoEm: serverTimestamp(),
      });

      
      toast.success('Pix iniciado. Veja o QR / Copia e Cola na tela de Chamadas quando disponível.');
      onClose?.();
    } catch (e) {
      console.error('[ModalPagamentoFreela] pix:', e);
      toast.error('Não foi possível iniciar o Pix.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-orange-700">
            💠 Pagar {freela?.nome?.toUpperCase?.() || 'Freela'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-content-center rounded-full text-gray-500 hover:bg-gray-100"
            aria-label="Fechar"
            title="Fechar"
          >
            ×
          </button>
        </div>

        {/* detalhes */}
        <p className="mt-2 text-sm text-gray-700">
          Valor da diária:{' '}
          <strong>R$ {Number(freela?.valorDiaria || 0).toFixed(2)}</strong>
        </p>

        {/* ações */}
        <div className="mt-4 grid gap-2">
          <button
            onClick={onPagarComCartao}
            className="w-full py-2 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white"
          >
            💳 Pagar com Cartão (senha salva)
          </button>

          <button
            onClick={onPagarViaPix}
            className="w-full py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
          >
            💸 Pagar via Pix (QR / Copia e Cola)
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
