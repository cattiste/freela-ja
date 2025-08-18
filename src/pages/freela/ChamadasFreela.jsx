// ✅ ChamadasFreela.jsx - atualizado
import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-hot-toast';

export default function ChamadasFreela({ usuario }) {
  const [chamadas, setChamadas] = useState([]);

  useEffect(() => {
    if (!usuario?.uid) return;
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const lista = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setChamadas(lista);
    });
    return () => unsub();
  }, [usuario?.uid]);

  const fazerCheckin = async (chamadaId) => {
    try {
      await updateDoc(doc(db, 'chamadas', chamadaId), {
        checkinFeito: true,
        checkinEm: serverTimestamp(),
        status: 'checkinFeito',
      });
      toast.success('Check-in realizado com sucesso!');
    } catch (err) {
      console.error('Erro ao fazer check-in:', err);
      toast.error('Erro ao fazer check-in');
    }
  };

  const fazerCheckout = async (chamadaId) => {
    try {
      await updateDoc(doc(db, 'chamadas', chamadaId), {
        checkoutFeito: true,
        checkoutEm: serverTimestamp(),
        status: 'checkoutFeito',
      });
      toast.success('Check-out realizado com sucesso!');
    } catch (err) {
      console.error('Erro ao fazer check-out:', err);
      toast.error('Erro ao fazer check-out');
    }
  };

  return (
    <div className="p-4">
      {chamadas.map((c) => (
        <div key={c.id} className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-lg font-bold">Chamada de {c.chamadorNome}</h3>
          <p>Status: {c.status}</p>
          <p>Observação: {c.observacao || '—'}</p>
          {!c.checkinFeito && c.status === 'aceita' && (
            <button
              onClick={() => fazerCheckin(c.id)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
            >
              Fazer check-in
            </button>
          )}
          {c.checkinFeito && !c.checkoutFeito && (
            <button
              onClick={() => fazerCheckout(c.id)}
              className="mt-2 px-4 py-2 bg-orange-600 text-white rounded"
            >
              Fazer check-out
            </button>
          )}
        </div>
      ))}
    </div>
  );
}


// ✅ ChamadasContratante.jsx - atualizado
import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-hot-toast';

export default function ChamadasContratante({ contratante }) {
  const [chamadas, setChamadas] = useState([]);

  useEffect(() => {
    if (!contratante?.uid) return;
    const q = query(
      collection(db, 'chamadas'),
      where('chamadorUid', '==', contratante.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkinFeito', 'checkinConfirmado', 'em_andamento'])
    );
    const unsub = onSnapshot(q, (snap) => {
      const lista = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setChamadas(lista);
    });
    return () => unsub();
  }, [contratante?.uid]);

  const confirmarCheckin = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'checkinConfirmado',
        checkinConfirmadoEm: serverTimestamp(),
      });
      toast.success('Check-in confirmado!');
    } catch (err) {
      console.error('Erro ao confirmar check-in:', err);
      toast.error('Erro ao confirmar check-in');
    }
  };

  const confirmarCheckout = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'finalizada',
        checkoutConfirmadoEm: serverTimestamp(),
      });
      toast.success('Check-out confirmado!');
    } catch (err) {
      console.error('Erro ao confirmar check-out:', err);
      toast.error('Erro ao confirmar check-out');
    }
  };

  return (
    <div className="p-4">
      {chamadas.map((c) => (
        <div key={c.id} className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-lg font-bold">Freela: {c.freelaNome}</h3>
          <p>Status: {c.status}</p>
          <p>Observação: {c.observacao || '—'}</p>
          {c.status === 'checkinFeito' && (
            <button
              onClick={() => confirmarCheckin(c.id)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Confirmar check-in
            </button>
          )}
          {c.status === 'checkoutFeito' && (
            <button
              onClick={() => confirmarCheckout(c.id)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
            >
              Confirmar check-out
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
