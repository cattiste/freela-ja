// ✅ ChamadasPessoaFisica.jsx — sem useNavigate
import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import MensagensRecebidasEstabelecimento from '@/components/MensagensRecebidasEstabelecimento';
import AvaliacaoInline from '@/components/AvaliacaoInline';
import PagamentoChamada from '@/pages/estabelecimento/PagamentoChamada';

export default function ChamadasPessoaFisica({ usuario }) {
  const [chamadas, setChamadas] = useState([]);

  useEffect(() => {
    if (!usuario?.uid) return;

    const q = query(
      collection(db, 'chamadas'),
      where('pessoaFisicaUid', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chamadasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChamadas(chamadasData);
    });

    return () => unsubscribe();
  }, [usuario]);

  const handleCheckIn = async (chamadaId) => {
    await updateDoc(doc(db, 'chamadas', chamadaId), {
      status: 'checkin_freela',
      checkInFreela: true,
      checkInFreelaHora: serverTimestamp(),
    });
  };

  const handleCheckOut = async (chamadaId) => {
    await updateDoc(doc(db, 'chamadas', chamadaId), {
      status: 'checkout_freela',
      checkOutFreela: true,
      checkOutFreelaHora: serverTimestamp(),
    });
  };

  return (
    <div className="space-y-4">
      {chamadas.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Nenhuma chamada registrada.
        </p>
      )}

      {chamadas.map((chamada) => (
        <div
          key={chamada.id}
          className="bg-white rounded-xl shadow p-4 border border-orange-100"
        >
          <div className="flex items-center gap-4">
            <img
              src={
                chamada.freelaFoto ||
                'https://via.placeholder.com/100'
              }
              alt={chamada.freelaNome}
              className="w-16 h-16 rounded-full object-cover border border-orange-300"
            />
            <div>
              <p className="text-lg font-bold text-orange-700">
                {chamada.freelaNome}
              </p>
              <p className="text-sm text-gray-600">
                Status:{' '}
                <span className="capitalize">{chamada.status}</span>
              </p>
              {chamada.valorDiaria && (
                <p className="text-sm text-gray-600">
                  💰 Diária: R$ {chamada.valorDiaria}
                </p>
              )}
            </div>
          </div>

          {chamada.observacao && (
            <p className="text-sm text-gray-700 mt-2">
              <strong>Instruções:</strong> {chamada.observacao}
            </p>
          )}

          <MensagensRecebidasEstabelecimento chamadaId={chamada.id} />

          {chamada.status === 'pendente' && (
            <p className="text-sm text-yellow-600 mt-2">
              ⏳ Aguardando aceitação do freela...
            </p>
          )}

          {chamada.status === 'aceita' && (
            <>
              <PagamentoChamada
                chamada={chamada}
                usuario={usuario}
                tipoChamador="pessoa_fisica"
              />
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
              className="w-full mt-2 bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
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
