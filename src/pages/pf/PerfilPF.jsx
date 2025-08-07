import React from 'react'
import { useAuth } from '@/context/AuthContext'

export default function PerfilPF() {
  const { usuario } = useAuth()

  if (!usuario) return <div className="text-center text-gray-500">Carregando...</div>

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <div className="flex items-center gap-4">
        <img
          src={usuario.foto || 'https://placehold.co/100x100'}
          alt="Foto de perfil"
          className="w-20 h-20 rounded-full object-cover border border-orange-300"
        />
        <div>
          <h2 className="text-xl font-bold text-orange-600">{usuario.nome}</h2>
          <p className="text-sm text-gray-600">📱 {usuario.celular}</p>
          <p className="text-sm text-gray-600">📧 {usuario.email}</p>
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-sm text-gray-600">🆔 CPF: {usuario.cpf || 'Não informado'}</p>
        <p className="text-sm text-gray-600">🎯 Cidade: {usuario.cidade || 'Não informada'}</p>
      </div>
    </div>
  )
}
