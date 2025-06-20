import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { profissionais } from '../data/profissionais'

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const profissional = profissionais.find(p => p.id === id)

  if (!profissional) {
    return <div className="p-6 text-center text-red-500">Profissional não encontrado.</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white shadow rounded-lg">
      <div className="flex flex-col sm:flex-row gap-6 items-center mb-6">
        <img
          src={profissional.imagem}
          alt={profissional.nome}
          className="w-36 h-36 rounded-full object-cover border-4 border-gray-100 shadow"
        />
        <div>
          <h2 className="text-2xl font-bold">{profissional.nome}</h2>
          <p className="text-gray-600"><strong>Especialidade:</strong> {profissional.especialidade}</p>
          <p className="text-gray-600"><strong>Cidade:</strong> {profissional.cidade}</p>
          <p className="text-yellow-500 mt-2 text-lg">⭐ {profissional.avaliacao}</p>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed">{profissional.descricao}</p>

      <button
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => navigate(-1)}
      >
        Voltar
      </button>
    </div>
  )
}
