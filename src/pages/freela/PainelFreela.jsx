// src/pages/freela/PainelFreela.jsx
import React from 'react'
import { useAuth } from '@/context/AuthContext'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()

  if (carregando) return <div className="text-center mt-10 text-orange-600">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10 text-red-600">Usuário não autenticado.</div>

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Painel do Freela</h1>
      <p>Bem-vindo, <span className="font-semibold">{usuario.nome || usuario.email}</span>!</p>
      <p className="mt-2 text-sm text-gray-600">UID: {usuario.uid}</p>
      <p className="mt-1 text-sm text-gray-600">Tipo: {usuario.tipo}</p>
    </div>
  )
}
