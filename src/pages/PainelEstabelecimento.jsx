import React, { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

// Components
import BuscarFreelas from './BuscarFreelas';
import ChamadasEstabelecimento from './ChamadasEstabelecimento';
import AgendasContratadas from './AgendasContratadas';
import AvaliacaoFreela from './AvaliacaoFreela';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';

interface Estabelecimento {
  uid: string;
  tipo: 'estabelecimento';
  nome: string;
  email: string;
  // ... outros campos
}

const AbaButton = ({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg transition-colors ${active ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
  >
    {children}
  </button>
);

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState<'buscar' | 'chamadas' | 'agendas' | 'avaliacao'>('buscar');
  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setEstabelecimento(null);
          return;
        }

        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data()?.tipo !== 'estabelecimento') {
          setErro('Acesso restrito a estabelecimentos.');
          return;
        }

        setEstabelecimento({ uid: user.uid, ...docSnap.data() } as Estabelecimento);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setErro('Falha ao carregar dados.');
      } finally {
        setCarregando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderConteudo = () => {
    if (!estabelecimento) return null;
    
    const componentes = {
      buscar: <BuscarFreelas estabelecimento={estabelecimento} />,
      chamadas: <ChamadasEstabelecimento estabelecimento={estabelecimento} />,
      agendas: <AgendasContratadas estabelecimento={estabelecimento} />,
      avaliacao: <AvaliacaoFreela estabelecimento={estabelecimento} />,
    };

    return componentes[aba] || componentes.buscar;
  };

  if (carregando) return <LoadingSpinner />;

  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-lg">{erro || 'Acesso não autorizado.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-6">📊 Painel do Estabelecimento</h1>
        
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {Object.entries({
            buscar: '🔍 Buscar Freelas',
            chamadas: '📞 Chamadas',
            agendas: '📅 Agendas',
            avaliacao: '⭐ Avaliar',
          }).map(([key, label]) => (
            <AbaButton
              key={key}
              active={aba === key}
              onClick={() => setAba(key as any)}
            >
              {label}
            </AbaButton>
          ))}
        </div>

        {erro && <Toast mensagem={erro} onClose={() => setErro(null)} />}
        {renderConteudo()}
      </div>
    </div>
  );
}