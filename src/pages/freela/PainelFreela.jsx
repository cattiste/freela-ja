import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreelaCard from '@/pages/freela/PerfilFreela'

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')

  if (carregando) return <div className="text-center mt-10 text-orange-600">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10 text-red-600">Usuário não autenticado.</div>

  // 🔁 Mover função aqui pra dentro
  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <div className="mt-4">
            <PerfilFreelaCard freelaId={usuario.uid} />
          </div>
        )
      default:
        return (
          <div className="mt-4 text-center text-gray-600">
            Conteúdo da aba <strong>{abaSelecionada}</strong> em construção.
          </div>
        )
    }
  }

  return (
    <div className="p-4 pb-20">
      <div className="bg-white rounded-xl p-4 shadow max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-orange-700 mb-2">Painel do Freela</h1>
        <p>Bem-vindo, <span className="font-semibold">{usuario.nome || usuario.email}</span>!</p>
        <p className="text-sm text-gray-600 mt-1">UID: {usuario.uid}</p>
        <p className="text-sm text-gray-600">Tipo: {usuario.tipo}</p>
        <p className="text-sm text-gray-600 mt-4">Aba atual: <strong>{abaSelecionada}</strong></p>
      </div>

      {renderConteudo()}

      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} alertas={{}} />
    </div>
  )
}
