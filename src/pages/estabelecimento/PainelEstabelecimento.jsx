import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasEstabelecimentoCompleto from '@/components/VagasEstabelecimentoCompleto'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'
import ConfigPagamentoEstabelecimento from '@/pages/estabelecimento/ConfigPagamentoEstabelecimento'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'
import ChamadaInline from '@/components/ChamadaInline'

const PainelEstabelecimento = () => {
  const [usuario, setUsuario] = useState(null);
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState('perfil');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    console.log('[Render] Estado: carregando...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth] onAuthStateChanged:', user);
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dados = docSnap.data();
          if (dados.tipo === 'estabelecimento') {
            setUsuario(user);
            setEstabelecimento(dados);
            console.log('[Auth] Estabelecimento identificado:', dados);
          } else {
            console.warn('[Auth] Usuário não é um estabelecimento.');
          }
        } else {
          console.warn('[Auth] Documento do usuário não encontrado.');
        }
      } else {
        console.warn('[Auth] Nenhum usuário logado.');
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  if (carregando) {
    return <p>[Render] Carregando...</p>;
  }

  const renderizarAba = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return <PerfilEstabelecimento estabelecimento={estabelecimento} />;
      case 'chamadas':
        return <ChamadasEstabelecimento />;
      case 'avaliacoes':
        return <AvaliacoesEstabelecimento />;
      case 'agenda':
        return <AgendaEstabelecimento />;
      case 'recebimentos':
        return <RecebimentosEstabelecimento />;
      default:
        return <PerfilEstabelecimento estabelecimento={estabelecimento} />;
    }
  };

  console.log('[Render] Painel carregado com sucesso');
  console.log('[Render] Aba selecionada:', abaSelecionada);

  return (
    <div className="painel-estabelecimento">
      {renderizarAba()}
      <MenuInferior
        abaSelecionada={abaSelecionada}
        setAbaSelecionada={setAbaSelecionada}
      />
    </div>
  );
};

export default PainelEstabelecimento;
