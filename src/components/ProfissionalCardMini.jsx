// src/components/ProfissionalCardMini.jsx
import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

function Estrelas({ media }) {
  const estrelasCheias = Math.floor(media);
  const temMeia = media % 1 >= 0.5;
  const estrelasVazias = 5 - estrelasCheias - (temMeia ? 1 : 0);

  return (
    <div className="flex justify-center mt-1 text-yellow-400">
      {[...Array(estrelasCheias)].map((_, i) => (
        <FaStar key={`cheia-${i}`} />
      ))}
      {temMeia && <FaStar className="opacity-50" />}
      {[...Array(estrelasVazias)].map((_, i) => (
        <FaRegStar key={`vazia-${i}`} />
      ))}
    </div>
  );
}

export default function ProfissionalCardMini({
  freela,
  usuario,
  onChamar,
  chamando,
  online,
  observacao,
  setObservacao,
}) {
  const distanciaFormatada = freela.distanciaKm
    ? `${freela.distanciaKm.toFixed(1)} km`
    : '—';

  const freelaUid = freela.uid || freela.id;

  return (
    <div className="bg-white/90 rounded-lg shadow-lg p-4 flex flex-col items-center">
      <div className="relative">
        <img
          src={freela.foto || 'https://via.placeholder.com/100'}
          alt={freela.nome}
          className="w-24 h-24 rounded-full object-cover border-2 border-white shadow"
        />
        <span
          className={`absolute bottom-0 right-0 text-xs px-2 py-1 rounded-full ${
            online ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          {online ? 'Online' : 'Offline'}
        </span>
      </div>

      <h2 className="mt-3 text-lg font-semibold text-center">{freela.nome}</h2>
      <p className="text-sm text-gray-600 text-center">{freela.funcao}</p>

      {/* ⭐ Estrelas de avaliação */}
      {freela.mediaAvaliacoes ? (
        <Estrelas media={freela.mediaAvaliacoes} />
      ) : (
        <p className="text-xs text-gray-500 mt-1">(sem avaliações)</p>
      )}

      <p className="text-sm mt-2">
        <strong>Diária:</strong>{' '}
        {freela.valorDiaria
          ? `R$ ${Number(freela.valorDiaria).toFixed(2)}`
          : 'Não informado'}
      </p>

      <p className="text-sm">
        <strong>Distância:</strong> {distanciaFormatada}
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
        onClick={() => onChamar(freela)}
        disabled={chamando === freelaUid}
        className="mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50"
      >
        {chamando === freelaUid ? 'Chamando...' : 'Chamar'}
      </button>
    </div>
  );
}
