import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { FaStar } from 'react-icons/fa';

function toMillis(v) {
  if (!v) return 0;
  if (typeof v?.toMillis === 'function') return v.toMillis();
  if (typeof v?.seconds === 'number') return v.seconds * 1000;
  if (typeof v === 'number') return v;
  // se for string (algum legado), o Date.parse tenta resolver
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
}

export default function AvaliacoesRecebidasFreela() {
  const { usuario } = useAuth();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.uid) return;

    // ⚠️ Requer índice composto:
    // Collection = avaliacoesFreelas
    // Fields: freelaUid ASC + criadoEm DESC
    const q = query(
      collection(db, 'avaliacoesFreelas'),
      where('freelaUid', '==', usuario.uid),
      orderBy('criadoEm', 'desc'),
      limit(10) // ajuste se quiser mais
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Fallback: garante ordem correta mesmo com docs antigos
        data.sort((a, b) => toMillis(b.criadoEm) - toMillis(a.criadoEm));
        setItens(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [usuario?.uid]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        Carregando avaliações…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-bold text-orange-600 flex items-center gap-2">
        ⭐ Avaliações Recebidas
      </h2>

      {itens.length === 0 ? (
        <p className="text-gray-500 mt-2">Nenhuma avaliação recebida ainda.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {itens.map((a) => (
            <div key={a.id} className="border rounded-lg p-3">
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} className={i < (a.nota || 0) ? '' : 'opacity-25'} />
                ))}
              </div>
              {a.comentario && (
                <p className="mt-1 text-sm text-gray-800">{a.comentario}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Contratante: {a.contratanteUid ? '---' : '---'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
