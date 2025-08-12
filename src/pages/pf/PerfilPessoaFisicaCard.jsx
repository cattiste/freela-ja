// src/pages/pf/PerfilPessoaFisicaCard.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const AVATAR_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <circle cx="40" cy="30" r="15" fill="#d1d5db"/>
  <rect x="18" y="54" width="44" height="16" rx="8" fill="#d1d5db"/>
</svg>`)

export default function PerfilPessoaFisicaCard({ pessoaFisica }) {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  if (!pessoaFisica) return null

  const podeEditar = usuario?.uid === pessoaFisica.uid

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={pessoaFisica.foto || AVATAR_PLACEHOLDER}
          alt="Foto"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-xl font-bold text-orange-700">{pessoaFisica.nome}</h2>
          <p className="text-gray-600 text-sm">{pessoaFisica.email}</p>
          <p className="text-gray-600 text-sm">{pessoaFisica.cpf}</p>
        </div>
      </div>

      <p className="text-gray-700">
        <strong>Endereço:</strong> {pessoaFisica.endereco || '—'}
      </p>

      {podeEditar && (
        <button
          onClick={() => navigate('/pf/editarperfil')}
          className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          ✏️ Editar Perfil
        </button>
      )}
    </div>
  )
}
