import React from 'react'

export default function ProfissionalCard({ prof, onChamar, distanciaKm }) {
  const imagemValida =
    typeof prof.foto === 'string' && prof.foto.trim() !== ''
      ? prof.foto
      : 'https://i.imgur.com/3W8i1sT.png'

  const diariaNumerica = !isNaN(parseFloat(prof.valorDiaria))

  return (
    <div className="bg-white rounded-2xl p-5 m-4 max-w-xs shadow-md text-center">
      <img
        src={imagemValida}
        alt={prof.nome || 'Profissional'}
        className="w-24 h-24 rounded-full object-cover mb-3 mx-auto border-2 border-orange-400 shadow"
      />

      <h3 className="text-lg font-bold text-gray-800">
        {prof.nome || 'Nome não informado'}
      </h3>

      <p className="text-gray-700 mt-1">
        <strong>Função:</strong> {prof.funcao || 'Não informado'}
      </p>

      {prof.endereco && (
        <p className="text-gray-700 mt-1">
          <strong>Endereço:</strong> {prof.endereco}
        </p>
      )}

      {typeof distanciaKm === 'number' && (
        <p className="text-blue-600 mt-1">
          <strong>📍 Distância:</strong> {distanciaKm.toFixed(1)} km
        </p>
      )}

      {typeof prof.avaliacao === 'number' && (
        <p className="text-yellow-500 mt-1">
          <strong>Avaliação:</strong> ⭐ {prof.avaliacao.toFixed(1)}
        </p>
      )}

      {diariaNumerica && (
        <p className="text-green-600 font-semibold mt-1">
          <strong>💸 Diária:</strong> R$ {parseFloat(prof.valorDiaria).toFixed(2)}
        </p>
      )}

      {prof.descricao && (
        <p className="italic mt-2 text-sm text-gray-600">{prof.descricao}</p>
      )}

      {onChamar && (
        <button
          onClick={() => onChamar(prof)}
          className="bg-green-600 text-white py-2 px-4 rounded-xl mt-4 hover:bg-green-700"
        >
          📩 Chamar
        </button>
      )}
    </div>
  )
}