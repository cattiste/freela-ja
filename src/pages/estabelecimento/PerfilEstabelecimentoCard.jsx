import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PerfilEstabelecimentoCard({ estabelecimento }) {
  const navigate = useNavigate()

  if (!estabelecimento) return null

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={estabelecimento.foto || '/placeholder.jpg'}
          alt="Foto"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-xl font-bold text-orange-700">{estabelecimento.nome}</h2>
          <p className="text-gray-600 text-sm">{estabelecimento.email}</p>
          <p className="text-gray-600 text-sm">{estabelecimento.cnpj}</p>
        </div>
      </div>

      <p className="text-gray-700">
        <strong>Endereço:</strong> {estabelecimento.endereco || '—'}
      </p>

      <button
        onClick={() => navigate(`/estabelecimento/editarperfil/${estabelecimento.uid}`)}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition"
      >
        ✏️ Editar Perfil
      </button>
    </div>
  )
}
