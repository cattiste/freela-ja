// src/pages/admin/PagamentosDashboardAdmin.jsx

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";

export default function PagamentosDashboardAdmin() {
  const [pagamentos, setPagamentos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const q = query(collection(db, "pagamentos"), orderBy("criadoEm", "desc"));
      const snap = await getDocs(q);
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPagamentos(lista);
    };
    carregar();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">💳 Pagamentos</h1>
      {pagamentos.length === 0 ? (
        <p className="text-center text-gray-600">Nenhum pagamento encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {pagamentos.map((pg) => (
            <li key={pg.id} className="bg-white shadow p-4 rounded-xl border border-gray-200">
              <p><strong>Chamada:</strong> {pg.chamadaId}</p>
              <p><strong>Freela:</strong> {pg.freelaUid}</p>
              <p><strong>Contratante:</strong> {pg.contratanteUid}</p>
              <p><strong>Valor:</strong> R$ {pg.valorTotal?.toFixed(2)}</p>
              <p><strong>Status:</strong> <span className="font-semibold">{pg.status}</span></p>
              <p className="text-sm text-gray-500">{new Date(pg.criadoEm?.toDate?.() || pg.criadoEm).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
