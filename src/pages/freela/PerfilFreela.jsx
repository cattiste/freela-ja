import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import {
  Mail, Phone, Briefcase, UserCircle2,
  MapPin, Home, BadgeDollarSign, ScrollText, Fingerprint
} from 'lucide-react';

const PerfilFreela = ({ freelaId, onEditar }) => {
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
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center w-full max-w-md mx-auto border">
      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-500 shadow mb-4">
        {freela.foto ? (
          <img
            src={freela.foto}
            alt="Foto do Freela"
            className="w-full h-full object-cover"
          />
        ) : (
          <UserCircle2 className="w-full h-full text-gray-300" />
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-800 text-center">
        {freela.nome?.toUpperCase() || 'NOME'}
      </h2>

      <div className="mt-4 space-y-2 text-sm text-gray-700 w-full">
        <div className="flex items-center gap-2">
          <Briefcase size={16} />
          <span>{freela.funcao || 'Função não informada'}</span>
        </div>

        <div className="flex items-center gap-2">
          <ScrollText size={16} />
          <span>{freela.especialidades || 'Especialidades não informadas'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone size={16} />
          <span>{freela.celular || 'Telefone não informado'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span>{freela.email || 'Email não informado'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Home size={16} />
          <span>{freela.endereco || 'Endereço não informado'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Fingerprint size={16} />
          <span>{freela.cpf || 'CPF não informado'}</span>
        </div>

        <div className="flex items-center gap-2">
          <BadgeDollarSign size={16} />
          <span>
            {freela.valorDiaria ? `R$ ${freela.valorDiaria},00 / diária` : 'Valor da diária não informado'}
          </span>
        </div>
      </div>

      {onEditar && (
        <button
          onClick={onEditar}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
        >
          ✏️ Editar Perfil
        </button>
      )}
    </div>
  );
};

export default PerfilFreela;
