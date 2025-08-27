// src/components/ListaCartoes.jsx
import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';

export default function ListaCartoes() {
  const { usuario } = useAuth();
  const [cartoes, setCartoes] = useState([]);

  useEffect(() => {
    if (!usuario?.uid) return;

    const fetchCartoes = async () => {
      const ref = collection(db, 'usuarios', usuario.uid, 'cartoes');
      const snap = await getDocs(ref);
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCartoes(lista);
    };

    fetchCartoes();
  }, [usuario]);

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Cartões Cadastrados</h2>
      {cartoes.length === 0 ? (
        <p className="text-gray-500">Nenhum cartão cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {cartoes.map(cartao => (
            <li key={cartao.id} className="p-3 border rounded shadow">
              <span className="block">Bandeira: {cartao.bandeira}</span>
              <span className="block">Final {cartao.ultimos4}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
