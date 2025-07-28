import React from 'react'
import { useAuth } from '@/context/AuthContext'
import PerfilFreelaCard from '@/pages/freela/PerfilFreela' // ✅ importe o componente corretamente

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()

  if (carregando) return <div className="text-center mt-10 text-orange-600">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10 text-red-600">Usuário não autenticado.</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Painel do Freela</h1>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <PerfilFreelaCard freelaId={usuario.uid} />
      </div>
    </div>
  )
}
