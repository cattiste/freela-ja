import React from 'react'

export default function ProfissionalCard({ prof, onChamar }) {
  return (
    <div className="card-profissional bg-white rounded-xl shadow-md p-5 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={prof.imagem || '/default-avatar.png'}
        alt={prof.nome || 'Foto do profissional'}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-xl font-semibold mb-1">{prof.nome || 'Nome não informado'}</h3>
      <p className="text-gray-600 mb-1">{prof.especialidade || 'Especialidade não informada'}</p>
      <p className="text-gray-500 text-sm mb-4">{prof.endereco || 'Endereço não informado'}</p>

      <button
        onClick={onChamar}
        className="btn-primary w-full"
        type="button"
        aria-label={`Chamar ${prof.nome}`}
      >
        Chamar
      </button>
    </div>
  )
}
