// ✅ BuscarFreelas.jsx (corrigido para exibir online/offline)
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import ProfissionalCardMini from '@/components/ProfissionalCardMini';
import ModalFreelaDetalhes from '@/components/ModalFreelaDetalhes';
import { calcularDistancia } from '@/utils/distancia';

export default function BuscarFreelas({ usuario, usuariosOnline = {} }) {
  const [freelas, setFreelas] = useState([]);
  const [filtroFuncao, setFiltroFuncao] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [observacao, setObservacao] = useState({});
  const [chamando, setChamando] = useState(null);

  useEffect(() => {
    if (!usuario) return;
    const carregarFreelas = async () => {
      try {
        const snap = await getDocs(collection(db, 'usuarios'));
        const lista = snap.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(u => u.tipo === 'freela');
        setFreelas(lista);
      } catch (err) {
        console.error('Erro ao carregar freelas:', err);
      }
    };
    carregarFreelas();
  }, [usuario]);

  const freelasFiltrados = useMemo(() => {
    const agora = Date.now();
    return freelas
      .filter(f =>
        mostrarTodos || usuariosOnline[f.id]?.state === 'online')
      .filter(f =>
        !filtroFuncao || f?.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase()))
      .map(f => {
        const distanciaKm = f.coordenadas && usuario?.coordenadas
          ? calcularDistancia(
              usuario.coordenadas.latitude,
              usuario.coordenadas.longitude,
              f.coordenadas.latitude,
              f.coordenadas.longitude
            )
          : null;
        return { ...f, distanciaKm };
      })
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
  }, [freelas, filtroFuncao, usuario, mostrarTodos, usuariosOnline]);

  const chamarFreela = useCallback(async (freela) => {
    if (!usuario?.uid) return;
    const freelaUid = freela.uid || freela.id;
    setChamando(freelaUid);

    const obs = (observacao[freelaUid] || '').trim();
    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid,
        freelaNome: freela.nome,
        chamadorUid: usuario.uid,
        chamadorNome: usuario.nome || '',
        tipoChamador: usuario.tipo,
        contratanteUid: usuario.uid,
        valorDiaria: freela.valorDiaria ?? null,
        observacao: obs,
        status: 'pendente',
        criadoEm: serverTimestamp(),
      });
      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`);
    } catch (err) {
      console.error('Erro ao chamar freela:', err);
      alert('Erro ao chamar freelancer.');
    } finally {
      setChamando(null);
    }
  }, [usuario, observacao]);

  return (
    <div className="min-h-screen bg-cover bg-center p-4 pb-20" style={{ backgroundImage: `url('/img/fundo-login.jpg')` }}>
      <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={e => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300"
        />
        <button
          onClick={() => setMostrarTodos(v => !v)}
          className="px-4 py-2 rounded-lg bg-white border border-orange-300"
        >
          {mostrarTodos ? 'Mostrar apenas ONLINE' : 'Ver também OFFLINE'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {freelasFiltrados.map(freela => (
          <ProfissionalCardMini
            key={freela.id}
            freela={freela}
            isOnline={usuariosOnline[freela.id]?.state === 'online'}
            onChamar={chamarFreela}
            chamando={chamando}
            observacao={observacao[freela.id] || ''}
            setObservacao={(texto) =>
              setObservacao(prev => ({ ...prev, [freela.id]: texto }))
            }
          />
        ))}
      </div>
    </div>
  );
}
