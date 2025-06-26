import React from 'react'

export default function ProfissionalCard({ prof }) {
  return (
    <div
      className="
        bg-white rounded-[16px] p-5 m-4 max-w-xs
        shadow-md text-center
        transition-transform duration-200
        hover:-translate-y-1
      "
    >
      <img
        src={prof.imagem}
        alt={prof.nome}
        className="w-24 h-24 rounded-full object-cover mb-3 mx-auto"
      />
      <h3 className="text-lg font-semibold">{prof.nome}</h3>
      <p className="text-gray-700 mt-1">
        <strong>Especialidade:</strong> {prof.especialidade}
      </p>
      <p className="text-gray-700 mt-1">
        <strong>Cidade:</strong> {prof.cidade}
      </p>
      <p className="text-yellow-500 mt-1">
        <strong>Avaliação:</strong> ⭐ {prof.avaliacao.toFixed(1)}
      </p>
      <p className="italic mt-2 text-sm text-gray-700">{prof.descricao}</p>
      <button
        className="
          bg-green-600 text-white py-2 px-4 rounded-xl mt-3
          hover:bg-green-700 cursor-pointer
          transition-colors duration-200
        "
      >
        📩 Chamar
      </button>
    </div>
  )
}
