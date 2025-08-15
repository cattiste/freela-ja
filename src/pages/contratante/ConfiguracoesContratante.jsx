// src/pages/contratante/ConfiguracoesContratante.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ConfiguracoesContratante() {
  const { logout } = useAuth()

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Configurações</h2>

      <div className="space-y-4">
        <Link
          to="/contratante/editarperfil"
          className="block px-4 py-3 bg-orange-600 text-white rounded-lg text-center hover:bg-orange-700"
        >
          Editar Perfil
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>
    </div>
  )
}
