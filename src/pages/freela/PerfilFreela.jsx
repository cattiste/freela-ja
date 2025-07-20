import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const PerfilFreela = ({ freelaId }) => {
  const [freela, setFreela] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreela = async () => {
      try {
        const docRef = doc(db, 'usuarios', freelaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFreela(docSnap.data());
        }
      } catch (error) {
        console.error('Erro ao buscar dados do freela:', error);
      } finally {
        setLoading(false);
      }
    };

    if (freelaId) fetchFreela();
  }, [freelaId]);

  if (loading) return <p className="text-center">Carregando perfil...</p>;
  if (!freela) return <p className="text-center text-red-600">Freela não encontrado.</p>;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center w-full">
      <img
        src={freela.fotoUrl || "https://placehold.co/120x120"}
        alt="Foto do Freela"
        className="rounded-full w-28 h-28 object-cover mb-4"
      />
      <h2 className="text-xl font-bold">{freela.nome || "Nome não informado"}</h2>
      <p className="text-sm text-gray-500">Função: {freela.funcao || "Função não informada"}</p>
      <p className="text-sm text-gray-500">Telefone: {freela.telefone || "Telefone não informado"}</p>
      <p className="text-sm text-gray-500">Email: {freela.email || "Email não informado"}</p>
    </div>
  );
};

export default PerfilFreela;
