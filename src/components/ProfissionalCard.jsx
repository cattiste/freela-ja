import React from 'react'

export default function ProfissionalCard({ prof, onChamar }) {
  return (
    <div
      className="
        bg-white rounded-2xl p-5 m-4 max-w-xs
        shadow-md text-center
        transition-transform duration-200
        hover:-translate-y-1
      "
    >
      <img
        src={prof.imagem || 'https://i.imgur.com/3W8i1sT.png'}
        alt={prof.nome}
        className="w-24 h-24 rounded-full object-cover mb-3 mx-auto border-2 border-orange-400 shadow"
      />

      <h3 className="text-lg font-bold text-gray-800">{prof.nome}</h3>

      <p className="text-gray-700 mt-1">
        <strong>Função:</strong> {prof.especialidade || 'Não informado'}
      </p>

      <p className="text-gray-700 mt-1">
        <strong>Endereço:</strong> {prof.endereco || 'Não informado'}
      </p>

      <p className="text-yellow-500 mt-1">
        <strong>Avaliação:</strong> ⭐ {typeof prof.avaliacao === 'number' ? prof.avaliacao.toFixed(1) : 'N/A'}
      </p>

      {prof.valorDiaria && (
        <p className="text-green-600 font-semibold mt-1">
          <strong>💸 Diária:</strong> R$ {parseFloat(prof.valorDiaria).toFixed(2)}
        </p>
      )}

      {prof.descricao && (
        <p className="italic mt-2 text-sm text-gray-600">{prof.descricao}</p>
      )}

      <button
        onClick={() => onChamar && onChamar(prof)}
        className="
          bg-green-600 text-white py-2 px-4 rounded-xl mt-4
          hover:bg-green-700 cursor-pointer
          transition-colors duration-200
        "
      >
        📩 Chamar
      </button>
    </div>
  )
}
