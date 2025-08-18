import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import AvaliacaoInline from '@/components/AvaliacaoInline';

export default function ChamadasContratante() {
  const { usuario } = useAuth();
  const [chamadas, setChamadas] = useState([]);
  const [avaliando, setAvaliando] = useState(null);

  useEffect(() => {
    if (!usuario?.uid) return;
    const q = query(collection(db, 'chamadas'), where('chamadorUid', '==', usuario.uid));
    const unsub = onSnapshot(q, (snap) => {
      const lista = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setChamadas(lista);
    });
    return () => unsub();
  }, [usuario?.uid]);

  const confirmarCheckin = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      checkinConfirmado: true,
      atualizadoEm: serverTimestamp(),
    });
  };

  const confirmarCheckout = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      checkoutConfirmado: true,
      atualizadoEm: serverTimestamp(),
    });
  };

  return (
    <div className="p-4 space-y-4">
      {chamadas.map((c) => {
        const checkinFeito = c.checkinFeito;
        const podeConfirmarCheckin = checkinFeito && !c.checkinConfirmado;
        const podeConfirmarCheckout = c.checkoutFeito && !c.checkoutConfirmado;
        const podeAvaliar = c.checkoutConfirmado && !c.avaliacaoFeita;

        return (
          <div
            key={c.id}
            className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-2"
          >
            <h2 className="font-bold text-lg text-orange-700">
              {c.freelaNome || 'Profissional'}
            </h2>
            <p className="text-sm text-gray-600">Status: {c.status}</p>
            <p className="text-sm">Observações: {c.observacao || '—'}</p>

            {podeConfirmarCheckin && (
              <button
                onClick={() => confirmarCheckin(c.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Confirmar Check-in
              </button>
            )}

            {podeConfirmarCheckout && (
              <button
                onClick={() => confirmarCheckout(c.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Confirmar Check-out
              </button>
            )}

            {podeAvaliar && (
              <AvaliacaoInline
                chamadaId={c.id}
                tipo="freela"
                avaliadoId={c.freelaUid}
                onDone={() => setAvaliando(null)}
              />
            )}

            {c.checkinConfirmado && (
              <p className="text-sm text-green-700 mt-1">✅ Check-in confirmado</p>
            )}
            {c.checkoutConfirmado && (
              <p className="text-sm text-green-700 mt-1">✅ Check-out confirmado</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
