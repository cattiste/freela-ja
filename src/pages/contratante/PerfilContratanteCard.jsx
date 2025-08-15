// src/components/PerfilContratanteCard.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function PerfilContratanteCard({ contratante }) {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  if (!contratante) return null

  const podeEditar = usuario?.uid === contratante.uid

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={contratante.foto || 'https://via.placeholder.com/100'}
          alt="Foto"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-xl font-bold text-orange-700">{contratante.nome}</h2>
          <p className="text-gray-600 text-sm">{contratante.email}</p>
          <p className="text-gray-700">
            <strong>{contratante.cnpj ? 'CNPJ' : 'CPF'}:</strong>{' '}
            {contratante.cnpj || contratante.cpf || 'Não informado'}
          </p>
        </div>
      </div>

      <p className="text-gray-700">
        <strong>Endereço:</strong> {contratante.endereco || '—'}
      </p>

      {podeEditar && (
        <button
          onClick={() => navigate('/contratante/editarperfilcontratante')}
          className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          ✏️ Editar Perfil
        </button>
      )}
    </div>
  )
}
