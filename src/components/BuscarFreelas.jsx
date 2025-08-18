// src/components/BuscarFreelas.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import useStatusRTDB from '@/hooks/useStatusRTDB';
import ProfissionalCardMini from './ProfissionalCardMini';
import ProfissionalCard from './ProfissionalCard';

export default function BuscarFreelas({ usuario }) {
  const [freelas, setFreelas] = useState([]);
  const [filtroFuncao, setFiltroFuncao] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [freelaSelecionado, setFreelaSelecionado] = useState(null);

  const usuariosOnline = useStatusRTDB();
  const now = Date.now();

  const estaOnline = (status) => {
    if (!status) return false;
    const ts = status?.last_changed || status?.lastSeen || status?.updatedAt;
    const tsMs = typeof ts === 'number' ? ts : ts?.seconds ? ts.seconds * 1000 : 0;
    return (status.state === 'online' || status.online) && now - tsMs <= 120000;
  };

  useEffect(() => {
    async function carregarFreelas() {
      try {
        const snap = await getDocs(
          query(collection(db, 'usuarios'), where('tipo', '==', 'freela'), limit(60))
        );
        const lista = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        setFreelas(lista);
      } catch (err) {
        console.error('Erro ao carregar freelas:', err);
      }
    }
    carregarFreelas();
  }, []);

  const ordenarPorOnline = (lista) => {
    return [...lista].sort((a, b) => {
      const statusA = usuariosOnline[a.id];
      const statusB = usuariosOnline[b.id];
      return estaOnline(statusB) - estaOnline(statusA); // online em cima
    });
  };

  const filtrados = useMemo(() => {
    return ordenarPorOnline(
      freelas
        .filter((f) =>
          !filtroFuncao || f.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
        )
        .map((f) => {
          const status = usuariosOnline[f.id];
          return { ...f, online: estaOnline(status) };
        })
    );
  }, [freelas, filtroFuncao, usuariosOnline]);

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Buscar por função..."
        className="w-full mb-4 px-4 py-2 border rounded"
        value={filtroFuncao}
        onChange={(e) => setFiltroFuncao(e.target.value)}
      />

      {filtrados.length === 0 ? (
        <p className="text-center text-white">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((freela) => (
            <div key={freela.id}>
              <div onClick={() => {
                setFreelaSelecionado(freela);
                setModalAberto(true);
              }}>
                <ProfissionalCardMini
                  freela={freela}
                  online={freela.online}
                  onChamar={() => console.log('Chamar freela', freela.nome)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && freelaSelecionado && (
        <ProfissionalCard
          freela={freelaSelecionado}
          isOnline={freelaSelecionado.online}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
