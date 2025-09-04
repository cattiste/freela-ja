// src/components/ModalPagamentoFreela.jsx
import React, { useState } from 'react';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function ModalPagamentoFreela({ freela, onClose, pagamentoDocId }) {
  if (!freela) return null;

  const { usuario } = useAuth() || {};
  const contratanteUid = usuario?.uid || null;

  const resolveDocId = () =>
    pagamentoDocId || freela?.chamadaId || freela?.chamada_id || freela?.id;

  async function upsertPagamento(docId, data) {
    const ref = doc(db, 'pagamentos_usuarios', String(docId));
    await setDoc(ref, { ...data, atualizadoEm: serverTimestamp() }, { merge: true });
  }

  const diaria = Number(freela?.valorDiaria || 0);
  const valorContratante = +(diaria * 1.10).toFixed(2);
  const valorFreela      = +(diaria * 0.90).toFixed(2);

  const [step, setStep] = useState('escolha');
  const [pin, setPin]   = useState('');
  const [busy, setBusy] = useState(false);

  async function onPagarComCartao() {
    const docId = resolveDocId();
    console.log('[Pagamento][Cartão] contratanteUid:', contratanteUid, 'docId:', docId);
    if (!contratanteUid) { toast.error('Faça login como contratante.'); return; }
    if (!docId)          { toast.error('Chamada não identificada para pagamento.'); return; }

    try {
      setBusy(true);
      await upsertPagamento(docId, {
        metodo: 'cartao',
        status: 'aguardando_confirmacao',
        contratanteUid,
        freelaUid: freela?.uid || freela?.id || null,
        freelaNome: freela?.nome || '',
        valorDiaria: diaria,
        valorContratante,
        valorFreela,
        contratadoEm: serverTimestamp(),
      });
      setStep('pin');
    } catch (e) {
      console.error('[Pagamento] iniciar cartão — Firestore error:', e);
      toast.error('Não foi possível iniciar o pagamento por cartão.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmarPagamentoComSenha() {
    const docId = resolveDocId();
    if (!pin || pin.length < 4) { toast.error('Digite sua senha.'); return; }
    try {
      setBusy(true);
      await updateDoc(doc(db, 'pagamentos_usuarios', String(docId)), {
        status: 'pago',
        confirmadoEm: serverTimestamp(),
      });
      toast.success('Pagamento confirmado!');
      onClose?.();
    } catch (e) {
      console.error('[Pagamento] confirmar cartão — Firestore error:', e);
      toast.error('Falha ao confirmar o pagamento.');
    } finally {
      setBusy(false);
    }
  }

  async function onPagarViaPix() {
    const docId = resolveDocId();
    console.log('[Pagamento][Pix] contratanteUid:', contratanteUid, 'docId:', docId);
    if (!contratanteUid) { toast.error('Faça login como contratante.'); return; }
    if (!docId)          { toast.error('Chamada não identificada para pagamento.'); return; }

    try {
      setBusy(true);
      await upsertPagamento(docId, {
        metodo: 'pix',
        status: 'pix_pendente',
        contratanteUid,
        freelaUid: freela?.uid || freela?.id || null,
        freelaNome: freela?.nome || '',
        valorDiaria: diaria,
        valorContratante,
        valorFreela,
        contratadoEm: serverTimestamp(),
      });
      toast.success('Pix iniciado. Veja o QR/Copia-e-Cola na tela de Chamadas quando disponível.');
      onClose?.();
    } catch (e) {
      console.error('[Pagamento] iniciar pix — Firestore error:', e);
      toast.error('Não foi possível iniciar o Pix.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-orange-700">💠 Pagar {freela?.nome?.toUpperCase?.() || 'Freela'}</h3>
          <button onClick={onClose} className="w-8 h-8 grid place-content-center rounded-full text-gray-500 hover:bg-gray-100">×</button>
        </div>

        <p className="mt-2 text-sm text-gray-700">Valor da diária: <strong>R$ {diaria.toFixed(2)}</strong></p>

        {step === 'escolha' ? (
          <div className="mt-4 grid gap-2">
            <button onClick={onPagarComCartao} disabled={busy} className="w-full py-2 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-60">
              💳 Pagar com Cartão (senha salva)
            </button>
            <button onClick={onPagarViaPix} disabled={busy} className="w-full py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-60">
              💸 Pagar via Pix (QR / Copia e Cola)
            </button>
            <button onClick={onClose} className="w-full py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">Cancelar</button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <label className="text-sm text-gray-600">Digite sua senha para confirmar o pagamento</label>
            <input type="password" inputMode="numeric" maxLength={6} className="w-full px-3 py-2 border rounded-lg" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" autoFocus />
            <button onClick={confirmarPagamentoComSenha} disabled={busy} className="w-full py-2 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-60">
              {busy ? 'Confirmando…' : 'Confirmar pagamento'}
            </button>
            <button onClick={() => setStep('escolha')} className="w-full py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
}
