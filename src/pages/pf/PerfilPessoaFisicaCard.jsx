import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function PerfilPessoaFisicaCard({ pessoaFisica }) {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  if (!pessoaFisica) return null

  const podeEditar = usuario?.uid === pessoaFisica.uid

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={pessoaFisica.foto || '/placeholder.jpg'}
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
          onClick={() => navigate('/pessoa-fisica/editarperfil')}
          className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          ✏️ Editar Perfil
        </button>
      )}
    </div>
  )
}