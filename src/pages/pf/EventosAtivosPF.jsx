// ✅ AgendaEventosPF.jsx — versão para Pessoa Física
import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function AgendaEventosPF({ usuario }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (!usuario?.uid) return;

    const q = query(
      collection(db, 'chamadas'),
      where('pessoaFisicaUid', '==', usuario.uid),
      where('status', 'in', ['aceita', 'checkin_freela', 'checkout_freela', 'concluido']),
      orderBy('criadoEm', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(lista);
    });

    return () => unsubscribe();
  }, [usuario]);

  return (
    <div className="space-y-4">
      {eventos.length === 0 && <p className="text-sm text-center text-gray-500 mt-4">Nenhum evento agendado.</p>}

      {eventos.map(evento => (
        <div key={evento.id} className="bg-white rounded-xl p-4 shadow border border-orange-100">
          <p><strong>Data:</strong> {evento.data}</p>
          <p><strong>Função:</strong> {evento.funcao}</p>
          <p><strong>Freela:</strong> {evento.freelaNome || 'Não informado'}</p>
          <p><strong>Status:</strong> {evento.status}</p>
        </div>
      ))}
    </div>
  );
}
