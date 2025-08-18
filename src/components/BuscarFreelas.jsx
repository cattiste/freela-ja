// src/components/BuscarFreelas.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import useStatusRTDB from '@/hooks/useStatusRTDB';
import ProfissionalCard from './ProfissionalCard';

export default function BuscarFreelas({ usuario }) {
  const [freelas, setFreelas] = useState([]);
  const [filtroFuncao, setFiltroFuncao] = useState('');
  const [observacoes, setObservacoes] = useState({});
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

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filtrados = useMemo(() => {
    return [...freelas]
      .filter((f) =>
        !filtroFuncao || f.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
      )
      .map((f) => {
        const status = usuariosOnline[f.id];
        const online = estaOnline(status);
        const distanciaKm =
          f?.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null;
        return { ...f, online, distanciaKm };
      })
      .sort((a, b) => b.online - a.online); // Online em cima
  }, [freelas, filtroFuncao, usuariosOnline, usuario]);

  const handleChamar = (freela) => {
    if (!freela.online) return;
    console.log('Chamando freela:', freela.nome);
    // Aqui você chama a função real de chamada
  };

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
            <ProfissionalCard
              key={freela.id}
              prof={freela}
              online={freela.online}
              distanciaKm={freela.distanciaKm}
              observacao={observacoes[freela.id] || ''}
              setObservacao={(texto) =>
                setObservacoes((prev) => ({ ...prev, [freela.id]: texto }))
              }
              onChamar={() => handleChamar(freela)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
