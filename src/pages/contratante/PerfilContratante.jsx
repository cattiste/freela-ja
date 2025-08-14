// src/pages/contratante/PerfilContratante.jsx
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
//import { formatarTelefone } from '@/utils/formatarTelefone'
import AvaliacoesRecebidasContratante from './AvaliacoesRecebidasContratante'
import AgendasContratadas from '@/components/AgendasContratadas'
import MenuInferiorContratante from '@/components/MenuInferiorContratante'

export default function PerfilContratante() {
  const { usuario } = useAuth()
  if (!usuario) return null

  const {
    nome = '',
    email = '',
    celular = '',
    endereco = '',
    foto = '',
  } = usuario

  return (
    <div className="pb-24">
      <div className="bg-orange-100 shadow p-4 rounded-b-3xl flex items-center space-x-4">
        <img
          src={foto || 'https://via.placeholder.com/100'}
          alt={nome}
          className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
        />
        <div>
          <h2 className="text-xl font-bold text-orange-800">{nome}</h2>
          <p className="text-sm text-gray-700">{formatarTelefone(celular)}</p>
          <p className="text-sm text-gray-700">{email}</p>
          <p className="text-sm text-gray-700">{endereco}</p>
          <Link
            to="/contratante/editarperfil"
            className="text-xs text-blue-600 underline mt-1 inline-block"
          >
            ✏️ Editar perfil
          </Link>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-lg text-orange-800 mb-2">📅 Agenda</h3>
          <AgendasContratante />
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-lg text-orange-800 mb-2">⭐ Avaliações dos Freelas</h3>
          <AvaliacoesRecebidas tipo="contratante" />
        </div>
      </div>

      <MenuInferiorContratante />
    </div>
  )
}
