// ✅ ChamadasPessoaFisica.jsx com useNavigate importado corretamente
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import ChamadaInline from '@/components/ChamadaInline';
import MensagensRecebidasEstabelecimento from '@/components/MensagensRecebidasEstabelecimento';
import AvaliacaoInline from '@/components/AvaliacaoInline';
import PagamentoChamada from '@/pages/estabelecimento/PagamentoChamada';
import { useNavigate } from 'react-router-dom';

export default function ChamadasPessoaFisica({ usuario }) {
  const [chamadas, setChamadas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario?.uid) return;
    const q = query(
      collection(db, 'chamadas'),
      where('pessoaFisicaUid', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chamadasData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChamadas(chamadasData);
    });
    return () => unsubscribe();
  }, [usuario]);

  return (
    <div className="space-y-4">
      {chamadas.length === 0 && <p className="text-center text-sm text-gray-500 mt-4">Nenhuma chamada registrada.</p>}
      {chamadas.map((chamada) => (
        <div key={chamada.id} className="bg-white rounded-xl shadow p-4 border border-orange-100">
          <ChamadaInline chamada={chamada} usuario={usuario} tipo="pessoa_fisica" />

          {chamada.observacao && (
            <p className="text-sm text-gray-600 mt-2"><strong>Instruções:</strong> {chamada.observacao}</p>
          )}

          <MensagensRecebidasEstabelecimento chamadaId={chamada.id} />

          {chamada.status === 'concluido' && (
            <AvaliacaoInline chamada={chamada} tipo="freela" />
          )}

          {chamada.status === 'aceita' && (
            <PagamentoChamada chamada={chamada} usuario={usuario} tipoChamador="pessoa_fisica" />
          )}
        </div>
      ))}
    </div>
  );
}
