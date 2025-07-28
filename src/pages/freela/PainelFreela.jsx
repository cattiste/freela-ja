import React from 'react'
import { useAuth } from '@/context/AuthContext'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()

  if (carregando) return <div className="text-center mt-10 text-orange-600">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10 text-red-600">Usuário não autenticado.</div>

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10 text-center">
      <h1 className="text-2xl font-bold text-orange-700 mb-2">Painel do Freela</h1>
      <p className="text-gray-700">Olá, <strong>{usuario.nome || usuario.email}</strong>!</p>
      <p className="text-sm text-gray-500 mt-1">UID: {usuario.uid}</p>
      <p className="text-sm text-gray-500">Tipo: {usuario.tipo}</p>
    </div>
  )
}
