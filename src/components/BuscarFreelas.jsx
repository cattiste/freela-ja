import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import ProfissionalCardMini from '@/components/ProfissionalCardMini';
import ModalFreelaDetalhes from '@/components/ModalFreelaDetalhes';
import { calcularDistancia } from '@/utils/distancia';
import { estaOnline, TTL_PADRAO_MS } from '@/utils/bootPresence';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useRealtimePresence } from '@/hooks/useRealtimePresence';

export default function BuscarFreelas({
  usuario,
  usuariosOnline = {},
  ttlMs = TTL_PADRAO_MS,
}) {
  const [onlineUids, setOnlineUids] = useState([]);
  const [filtroFuncao, setFiltroFuncao] = useState('');
  const [observacao, setObservacao] = useState({});
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [chamando, setChamando] = useState(null);

  useEffect(() => {
    const now = Date.now();
    const uids = Object.entries(usuariosOnline)
      .filter(([_, v]) => estaOnline(v, now, ttlMs))
      .map(([k]) => k);
    setOnlineUids(uids);
  }, [usuariosOnline, ttlMs]);

  const { perfis: perfisOnline, loading: carregOnline } =
    useFreelasOnline(onlineUids);
  const { perfis: perfisTodos, loading: carregTodos } =
    useFreelasAll(mostrarTodos);
  const carregando = carregOnline || carregTodos;
  const basePerfis = mostrarTodos ? perfisTodos : perfisOnline;

  const freelasFiltrados = useMemo(() => {
    return basePerfis
      .map(f => {
        const distanciaKm =
          f?.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null;
        return { ...f, distanciaKm };
      })
      .filter(
        f =>
          !filtroFuncao ||
          f?.funcao
            ?.toLowerCase()
            .includes(filtroFuncao.toLowerCase())
      )
      .sort(
        (a, b) =>
          (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity)
      );
  }, [basePerfis, filtroFuncao, usuario]);

  const chamarFreela = useCallback(
    async freela => {
      if (!usuario?.uid) return;
      const freelaUid = freela.uid || freela.id;
      setChamando(freelaUid);

      const obs = (observacao[freelaUid] || '').trim();
      if (containsContactInfo(obs)) {
        alert(
          '🚫 Não inclua telefone, e-mail ou redes sociais nas instruções.'
        );
        setChamando(null);
        return;
      }

      try {
        const tipoChamador =
          usuario.tipo ||
          usuario.tipoUsuario ||
          usuario.subtipoComercial ||
          null;

        const pessoaFisicaUid =
          tipoChamador === 'pessoa_fisica' ||
          usuario.subtipoComercial === 'pf'
            ? usuario.uid
            : null;

        const contratanteUid =
          tipoChamador === 'contratante' ||
          usuario.subtipoComercial === 'contratante'
            ? usuario.uid
            : null;

        await addDoc(collection(db, 'chamadas'), {
          freelaUid,
          freelaNome: freela.nome,
          freelaFoto: freela.foto || '',
          freelaFuncao: freela.funcao || '',
          freela: {
            uid: freelaUid,
            nome: freela.nome,
            foto: freela.foto || '',
            funcao: freela.funcao || '',
          },
          chamadorUid: usuario.uid,
          chamadorNome: usuario.nome || '',
          tipoChamador: tipoChamador || '',
          pessoaFisicaUid,
          contratanteUid,
          valorDiaria: freela.valorDiaria ?? null,
          observacao: obs,
          status: 'pendente',
          criadoEm: serverTimestamp(),
        });

        alert(
          `Freelancer ${freela.nome} foi chamado com sucesso.`
        );
      } catch (err) {
        console.error('Erro ao chamar freela:', err);
        alert('Erro ao chamar freelancer.');
      } finally {
        setChamando(null);
      }
    },
    [usuario, observacao]
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={e => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="button"
          onClick={() => setMostrarTodos(v => !v)}
          className="px-4 py-2 rounded-lg bg-white/90 border border-orange-200 shadow-sm hover:shadow text-orange-700 font-medium"
        >
          {mostrarTodos
            ? 'Mostrar apenas ONLINE'
            : 'Ver também OFFLINE (recentes)'}
        </button>
      </div>

      {carregando ? (
        <p className="text-center text-white">
          Carregando freelancers...
        </p>
      ) : freelasFiltrados.length === 0 ? (
        <p className="text-center text-white">
          {mostrarTodos
            ? 'Nenhum freelancer encontrado.'
            : 'Nenhum freelancer online com essa função.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {freelasFiltrados.map(freela => (
            <FreelaCard
              key={freela.uid || freela.id}
              freela={freela}
              usuario={usuario}
              ttlMs={ttlMs}
              usuariosOnline={usuariosOnline}
              onChamar={chamarFreela}
              chamando={chamando}
              observacao={observacao}
              setObservacao={setObservacao}
            />
          ))}
        </div>
      )}
    </div>
  );
}
