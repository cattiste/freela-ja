// src/components/ProfissionalCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function ProfissionalCard({ prof }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 text-center hover:scale-105 transition">
      <img src={prof.imagem} alt={prof.nome} className="w-24 h-24 rounded-full mx-auto mb-3" />
      <h3 className="text-lg font-semibold">{prof.nome}</h3>
      <p className="text-sm text-gray-600">{prof.especialidade}</p>
      <p className="text-sm text-gray-500">{prof.cidade}</p>
      <p className="mt-1 text-yellow-500">⭐ {prof.avaliacao}</p>
      <Link to={`/perfil/${prof.id}`}>
        <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Ver Perfil
        </button>
      </Link>
    </div>
  )
}
