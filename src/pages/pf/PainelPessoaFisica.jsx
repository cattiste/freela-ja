// ✅ PainelPessoaFisica.jsx completo e corrigido
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import MenuInferiorPF from '@/components/MenuInferiorPF';
import AvaliacoesRecebidasPF from './AvaliacoesRecebidasPF';
import BuscarFreelas from '../estabelecimento/BuscarFreelas';
import ChamadasPessoaFisica from './ChamadasPessoaFisica';
import AgendaPessoaFisica from './AgendaPessoaFisica';
import { useLocation } from 'react-router-dom';

export default function PainelPessoaFisica() {
  const { usuario } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  const [dados, setDados] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location?.state?.aba) setAbaAtiva(location.state.aba);
  }, [location]);

  useEffect(() => {
    if (!usuario?.uid) return;
    const carregar = async () => {
      const ref = doc(db, 'usuarios', usuario.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setDados(snap.data());
    };
    carregar();
  }, [usuario]);

  const renderizarConteudo = () => {
    if (abaAtiva === 'inicio') {
      return (
        <div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200 mb-4">
            <h2 className="text-lg font-bold text-orange-700 flex items-center gap-2">
              <UserIcon className="h-6 w-6" /> Meus Dados
            </h2>
            <p><strong>Nome:</strong> {dados?.nome}</p>
            <p><strong>Email:</strong> {dados?.email}</p>
            <p><strong>Telefone:</strong> {dados?.telefone || 'Não informado'}</p>
            <p><strong>Endereço:</strong> {dados?.endereco || 'Não informado'}</p>
            {dados?.foto && <img src={dados.foto} alt="Foto de perfil" className="w-24 h-24 rounded-full mt-2 border border-orange-400 object-cover" />}
          </div>
          <AvaliacoesRecebidasPF />
          <div className="mt-4 text-center">
            <a
              href="/cadastro-evento"
              className="bg-orange-500 text-white px-4 py-2 rounded-full shadow hover:bg-orange-600"
            >
              📆 Publicar Evento
            </a>
          </div>
        </div>
      );
    }
    if (abaAtiva === 'buscar') return <BuscarFreelas usuario={usuario} tipoChamador="pessoa_fisica" />;
    if (abaAtiva === 'candidatos') return <ChamadasPessoaFisica usuario={usuario} />;
    if (abaAtiva === 'agenda') return <AgendaPessoaFisica usuario={usuario} />;
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600891964599-f61ba0e24092)' }}>
      <div className="p-4 pb-24">
        {renderizarConteudo()}
      </div>
      <MenuInferiorPF abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
    </div>
  );
}
