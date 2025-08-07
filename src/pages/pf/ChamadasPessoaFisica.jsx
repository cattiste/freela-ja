// ✅ ChamadasPessoaFisica.jsx com visual alinhado ao painel do estabelecimento
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import MensagensRecebidasEstabelecimento from '@/components/MensagensRecebidasEstabelecimento';
import AvaliacaoInline from '@/components/AvaliacaoInline';
import PagamentoChamada from '@/pages/estabelecimento/PagamentoChamada';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ChamadasPessoaFisica() {
  const { usuario, carregando } = useAuth();
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

  const handleCheckIn = async (chamadaId) => {
    await updateDoc(doc(db, 'chamadas', chamadaId), {
      status: 'checkin_freela',
      checkInFreela: true,
      checkInFreelaHora: serverTimestamp()
    });
  };

  const handleCheckOut = async (chamadaId) => {
    await updateDoc(doc(db, 'chamadas', chamadaId), {
      status: 'checkout_freela',
      checkOutFreela: true,
      checkOutFreelaHora: serverTimestamp()
    });
  };

  const badgeStatus = (status) => {
    const cores = {
      aceita: 'bg-yellow-200 text-yellow-700',
      checkin_freela: 'bg-purple-200 text-purple-700',
      checkout_freela: 'bg-blue-200 text-blue-700',
      concluido: 'bg-gray-200 text-gray-700'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cores[status] || 'bg-gray-200 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (carregando) {
    return <p className="text-center text-white mt-10">Carregando usuário...</p>;
  }

  if (!usuario) {
    return <p className="text-center text-red-500 mt-10">Erro: Usuário não logado.</p>;
  }

  return (
    <div className="space-y-4">
      {chamadas.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">Nenhuma chamada registrada.</p>
      )}

      {chamadas.map((chamada) => (
        <div key={chamada.id} className="bg-white rounded-xl p-4 shadow border border-orange-100 space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={chamada.freelaFoto || 'https://placehold.co/100x100'}
              alt={chamada.freelaNome}
              className="w-10 h-10 rounded-full border border-orange-300 object-cover"
            />
            <div className="flex-1">
              <p className="font-bold text-orange-600">{chamada.freelaNome}</p>
              {chamada.valorDiaria && (
                <p className="text-xs text-gray-500">💰 R$ {chamada.valorDiaria} / diária</p>
              )}
              <p className="text-sm mt-1">📌 Status: {badgeStatus(chamada.status)}</p>
              {chamada.observacao && (
                <p className="text-xs text-gray-700 mt-1"><strong>Instruções:</strong> {chamada.observacao}</p>
              )}
              <MensagensRecebidasEstabelecimento chamadaId={chamada.id} />
            </div>
          </div>

          {chamada.status === 'pendente' && (
            <p className="text-sm text-yellow-600">⏳ Aguardando aceitação do freela...</p>
          )}

          {chamada.status === 'aceita' && (
            <>
              <PagamentoChamada chamada={chamada} usuario={usuario} tipoChamador="pessoa_fisica" />
              <button
                onClick={() => handleCheckIn(chamada.id)}
                className="w-full mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                ✅ Fazer Check-in
              </button>
            </>
          )}

          {chamada.status === 'checkin_freela' && (
            <button
              onClick={() => handleCheckOut(chamada.id)}
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
            >
              📤 Fazer Check-out
            </button>
          )}

          {chamada.status === 'concluido' && (
            <AvaliacaoInline chamada={chamada} tipo="freela" />
          )}
        </div>
      ))}
    </div>
  );
}
