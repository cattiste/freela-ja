// src/pages/freela/PerfilFreela.jsx

import React from 'react'

export default function PerfilFreela({ freela }) {
  if (!freela) {
    return <div className="text-center text-gray-500">Carregando perfil...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <img
        src={freela.foto || 'https://via.placeholder.com/100'}
        alt="Foto do Freela"
        className="w-24 h-24 rounded-full mx-auto border-2 border-orange-300 object-cover"
      />
      <h2 className="text-xl font-bold text-orange-700 mt-2">{freela.nome}</h2>
      <p className="text-sm text-gray-600">{freela.especialidade}</p>
      <p className="text-sm text-gray-600">📞 {freela.celular}</p>
    </div>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
      <PerfilFreela freela={freela} />
      <AgendaFreela freela={freela} />
      <AvaliacoesRecebidasFreela freelaUid={freela.uid} />
      
    </div>

  )
}
