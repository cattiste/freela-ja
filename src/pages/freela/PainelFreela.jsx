import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela' // ✅ Certifique-se que esse componente existe!

export default function PainelFreela() {
  const { usuario, carregando } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')

  if (carregando) return <div className="text-center mt-10 text-orange-600">Verificando autenticação...</div>
  if (!usuario) return <div className="text-center mt-10 text-red-600">Usuário não autenticado.</div>

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return (
          <div className="mt-4">
            <PerfilFreela freelaId={usuario.uid} />
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
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} alertas={{}} />
    </div>
  )
}
