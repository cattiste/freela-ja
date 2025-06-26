import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AgendaFreela from '../components/AgendaFreela';

export default function PainelFreela() {
  const navigate = useNavigate();
  const [freela, setFreela] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [chamadas, setChamadas] = useState([]);
  const [audioChamada] = useState(
    () => new Audio('https://res.cloudinary.com/dbemvuau3/video/upload/v1750961914/qhkd3ojkqhi2imr9lup8.mp3')
  );

  // Pré-carrega o áudio
  useEffect(() => {
    audioChamada.load().catch(() => console.log('🔇 Erro ao carregar áudio.'));
  }, [audioChamada]);

  // Carrega dados do freelancer e configura listener de chamadas
  const carregarFreela = useCallback(async () => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login');
      return;
    }

    try {
      const freelaRef = doc(db, 'usuarios', usuario.uid);
      const freelaSnap = await getDoc(freelaRef);

      if (!freelaSnap.exists()) {
        alert('Freelancer não encontrado no banco de dados.');
        navigate('/login');
        return;
      }

      const dadosFreela = freelaSnap.data();
      setFreela({ uid: usuario.uid, ...dadosFreela });

      // Listener para chamadas em tempo real
      const chamadasRef = collection(db, 'chamadas');
      const q = query(
        chamadasRef,
        where('freelaUid', '==', usuario.uid),
        orderBy('criadoEm', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const chamada = { id: change.doc.id, ...change.doc.data() };
              alert(`📩 Você foi chamado pelo estabelecimento ${chamada.estabelecimentoNome}!`);
              tocarSomChamada();
              setChamadas((prev) => [chamada, ...prev]);
            }
          });
        },
        (err) => console.error('Erro ao escutar chamadas:', err)
      );

      return unsubscribe; // Cleanup do listener
    } catch (err) {
      console.error('Erro ao carregar freelancer:', err);
      navigate('/login');
    }
  }, [navigate, audioChamada]);

  // Carrega dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      await carregarFreela();
      const vagasDisponiveis = JSON.parse(localStorage.getItem('vagas') || '[]';
      setVagas(vagasDisponiveis);
    };

    carregarDados();
  }, [carregarFreela]);

  // Toca som de chamada
  const tocarSomChamada = useCallback(() => {
    audioChamada.play().catch(() => console.log('🔇 Erro ao reproduzir som.'));
  }, [audioChamada]);

  // Aceita chamada
  const aceitarChamada = async (chamada) => {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'aceita' });
      alert('Você aceitou a chamada!');
      setChamadas((prev) =>
        prev.map((c) => (c.id === chamada.id ? { ...c, status: 'aceita' } : c))
      );
    } catch (err) {
      alert('Erro ao aceitar a chamada.');
      console.error(err);
    }
  };

  // Recusa chamada
  const recusarChamada = async (chamada) => {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'recusada' });
      alert('Você recusou a chamada.');
      setChamadas((prev) =>
        prev.map((c) => (c.id === chamada.id ? { ...c, status: 'recusada' } : c))
      );
    } catch (err) {
      alert('Erro ao recusar a chamada.');
      console.error(err);
    }
  };

  // Componente de Card de Vaga (extraído para melhor organização)
  const CardVaga = ({ vaga }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{vaga.titulo}</h3>
      <p><strong>🏢 Empresa:</strong> {vaga.empresa}</p>
      <p><strong>📍 Cidade:</strong> {vaga.cidade}</p>
      <p><strong>📄 Tipo:</strong> {vaga.tipo}</p>
      <p><strong>💰 Salário:</strong> {vaga.salario}</p>
      <p className="text-gray-600 mt-2 text-sm">{vaga.descricao}</p>
      <a
        href={`mailto:${vaga.emailContato}?subject=Candidatura para vaga: ${vaga.titulo}`}
        className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition"
      >
        ✅ Candidatar-se
      </a>
    </div>
  );

  // Componente de Card de Chamada (extraído para melhor organização)
  const CardChamada = ({ chamada }) => (
    <div className="mb-4 border-b pb-3">
      <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
      <p><strong>Data:</strong> {chamada.criadoEm?.toDate ? chamada.criadoEm.toDate().toLocaleString() : new Date(chamada.criadoEm).toLocaleString()}</p>
      <p><strong>Status:</strong> {chamada.status || 'pendente'}</p>
      {chamada.status !== 'aceita' && chamada.status !== 'recusada' && (
        <div className="mt-2 flex gap-3 justify-center">
          <button
            onClick={() => aceitarChamada(chamada)}
            className="bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700 transition"
            aria-label="Aceitar chamada"
          >
            ✔️ Aceitar
          </button>
          <button
            onClick={() => recusarChamada(chamada)}
            className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 transition"
            aria-label="Recusar chamada"
          >
            ❌ Recusar
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">🎯 Painel do Freelancer</h1>
          {freela && (
            <p className="text-gray-600 mt-2">
              Bem-vindo(a), <span className="font-semibold text-blue-600">{freela.nome}</span>
            </p>
          )}
        </div>

        {/* Seção Perfil e Agenda */}
        {freela && (
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            {/* Card Perfil */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <img
                  src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                  alt={freela.nome || "Foto do freelancer"}
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{freela.nome}</h2>
                  <p className="text-blue-600">{freela.funcao}</p>
                  <p className="text-gray-600 text-sm">{freela.especialidades}</p>
                  <p className="text-gray-500 text-sm">{freela.email}</p>
                  <p className="text-gray-600 text-sm mt-1">📍 {freela.endereco}</p>
                  <p className="text-green-700 font-semibold mt-1">💰 Diária: R$ {freela.valorDiaria || 'não informado'}</p>
                  <p className="text-gray-600 text-sm mt-1">📱 {freela.celular}</p>
                </div>
              </div>
              <div className="flex justify-center sm:justify-start">
                <button
                  onClick={() => navigate(`/editarfreela/${freela.uid}`)}
                  className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 px-5 rounded-full shadow-md"
                >
                  ✏️ Editar Perfil
                </button>
              </div>
            </div>

            {/* Card Agenda */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">📅 Agenda de Disponibilidade</h2>
              <AgendaFreela uid={freela.uid} />
            </div>
          </div>
        )}

        {/* Seção Vagas */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">📌 Vagas Disponíveis</h2>
          {vagas.length === 0 ? (
            <p className="text-gray-600 text-center">🔎 Nenhuma vaga disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vagas.map((vaga) => (
                <CardVaga key={vaga.id || vaga.titulo} vaga={vaga} />
              ))}
            </div>
          )}
        </div>

        {/* Seção Chamadas */}
        <div className="max-w-3xl mx-auto mt-12 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">📞 Chamadas Recentes</h2>
          {chamadas.length === 0 ? (
            <p>Nenhuma chamada recebida ainda.</p>
          ) : (
            chamadas.map((chamada) => (
              <CardChamada key={chamada.id} chamada={chamada} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}