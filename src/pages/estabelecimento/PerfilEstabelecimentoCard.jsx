// src/components/PerfilEstabelecimentoCard.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function PerfilEstabelecimentoCard({ estabelecimento }) {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  if (!estabelecimento) return null

  const podeEditar = usuario?.uid === estabelecimento.uid

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
          onClick={() => navigate('/estabelecimento/editarperfil')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ✏️ Editar Perfil
        </button>
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          {salvando ? 'Salvando...' : 'Salvar alterações'}
      
      )}
    </div>
  )
}
