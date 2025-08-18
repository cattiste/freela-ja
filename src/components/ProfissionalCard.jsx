import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaStar, FaRegStar } from 'react-icons/fa';

function Estrelas({ media }) {
  const estrelasCheias = Math.floor(media);
  const temMeia = media % 1 >= 0.5;
  const estrelasVazias = 5 - estrelasCheias - (temMeia ? 1 : 0);

  return (
    <div className="flex justify-center mt-1 text-yellow-500">
      {[...Array(estrelasCheias)].map((_, i) => <FaStar key={`c-${i}`} />)}
      {temMeia && <FaStar className="opacity-50" />}
      {[...Array(estrelasVazias)].map((_, i) => <FaRegStar key={`v-${i}`} />)}
    </div>
  );
}

export default function ProfissionalCard({
  prof,
  onChamar,
  chamando,
  observacao = {},
  setObservacao = () => {},
}) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [media, setMedia] = useState(null);
  const freelaUid = prof.uid || prof.id;

  useEffect(() => {
    async function loadAvaliacoes() {
      if (!freelaUid) return;
      const q = query(collection(db, 'avaliacoesFreelas'), where('freelaUid', '==', freelaUid));
      const snap = await getDocs(q);
      const lista = snap.docs.map(doc => doc.data());
      setAvaliacoes(lista);
      if (lista.length) {
        const soma = lista.reduce((acc, cur) => acc + (cur.nota || 0), 0);
        setMedia(soma / lista.length);
      }
    }

    loadAvaliacoes();
  }, [freelaUid]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center max-w-sm mx-auto">
      <img
        src={prof.fotoUrl || prof.foto || 'https://via.placeholder.com/100'}
        alt={prof.nome}
        className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-orange-400 shadow"
      />

      <h2 className="text-lg font-bold text-orange-700 mt-2">{prof.nome}</h2>
      <p className="text-sm text-gray-600">{prof.funcao}</p>
      {prof.especialidades && (
        <p className="text-xs text-gray-500">
          {Array.isArray(prof.especialidades) ? prof.especialidades.join(', ') : prof.especialidades}
        </p>
      )}

      {media && <Estrelas media={media} />}

      {avaliacoes.length > 0 && (
        <ul className="mt-2 text-left text-xs text-gray-700 max-h-24 overflow-y-auto">
          {avaliacoes.slice(0, 3).map((a, i) => (
            <li key={i} className="border-b border-gray-200 py-1">🗨️ {a.comentario || 'Sem comentário'}</li>
          ))}
        </ul>
      )}

      <p className="text-sm mt-2">
        <strong>Distância:</strong>{' '}
        {prof.distanciaKm != null ? `${prof.distanciaKm.toFixed(1)} km` : '—'}
      </p>

      <textarea
        rows={2}
        className="w-full mt-2 px-2 py-1 border rounded text-sm resize-none"
        placeholder="Instruções (ex: roupa preta)"
        value={observacao[freelaUid] || ''}
        onChange={(e) =>
          setObservacao((prev) => ({
            ...prev,
            [freelaUid]: e.target.value,
          }))
        }
      />

      <button
        onClick={() => onChamar(prof)}
        disabled={chamando === freelaUid}
        className="mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        {chamando === freelaUid ? 'Chamando...' : 'Chamar'}
      </button>
    </div>
  );
}
