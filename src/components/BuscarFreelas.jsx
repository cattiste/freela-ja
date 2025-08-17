// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import ProfissionalCardMini from '@/components/ProfissionalCardMini';
import { calcularDistancia } from '@/utils/distancia';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function BuscarFreelas({ usuario }) {
  const [filtroFuncao, setFiltroFuncao] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [observacao, setObservacao] = useState({});
  const [freelas, setFreelas] = useState([]);
  const [chamando, setChamando] = useState(null);

  const usuariosOnline = useOnlineStatus();

  useEffect(() => {
    const fetchFreelas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'usuarios'));
        const lista = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.tipo === 'freela');
        setFreelas(lista);
      } catch (err) {
        console.error('Erro ao carregar freelas:', err);
      }
    };
    fetchFreelas();
  }, []);

  const freelasFiltrados = useMemo(() => {
    return freelas
      .map(f => {
        const distanciaKm =
          f.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null;

        const online = usuariosOnline?.[f.id]?.state === 'online';

        return { ...f, distanciaKm, online };
      })
      .filter(f => {
        const matchFuncao = !filtroFuncao || f.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase());
        return mostrarTodos ? matchFuncao : f.online && matchFuncao;
      })
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
  }, [freelas, filtroFuncao, mostrarTodos, usuario, usuariosOnline]);

  const chamarFreela = async (freela) => {
    if (!usuario?.uid || !freela?.id) return;

    const obs = (observacao[freela.id] || '').trim();
    if (obs.includes('@') || obs.match(/\d{8,}/)) {
      alert('🚫 Não inclua telefone, e-mail ou redes sociais.');
      return;
    }

    setChamando(freela.id);
    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: freela.id,
        chamadorUid: usuario.uid,
        chamadorNome: usuario.nome || '',
        freelaNome: freela.nome,
        freelaFoto: freela.foto || '',
        freelaFuncao: freela.funcao || '',
        valorDiaria: freela.valorDiaria ?? null,
        status: 'pendente',
        criadoEm: serverTimestamp(),
        observacao: obs,
      });
      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`);
    } catch (err) {
      console.error('Erro ao chamar freela:', err);
      alert('Erro ao chamar freelancer.');
    } finally {
      setChamando(null);
    }
  };

  return (
    <div className="min-h-screen bg-cover p-4 pb-20"
      style={{ backgroundImage: `url('/img/fundo-login.jpg')`, backgroundSize: 'cover' }}>
      <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={e => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300"
        />
        <button
          onClick={() => setMostrarTodos(v => !v)}
          className="px-4 py-2 bg-white text-orange-700 border border-orange-400 rounded-lg"
        >
          {mostrarTodos ? 'Mostrar apenas ONLINE' : 'Ver também OFFLINE'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {freelasFiltrados.map(f => (
          <ProfissionalCardMini
            key={f.id}
            freela={f}
            usuario={usuario}
            onChamar={chamarFreela}
            chamando={chamando}
            online={f.online}
            observacao={observacao}
            setObservacao={setObservacao}
          />
        ))}
      </div>
    </div>
  );
}
