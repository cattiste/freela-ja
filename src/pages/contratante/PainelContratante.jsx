import React from 'react'
import { useAuth } from '@/context/AuthContext'
import MenuInferiorContratante from '@/components/MenuInferiorContratante'
import { Link } from 'react-router-dom'

export default function PainelContratante() {
  const { usuario, carregando } = useAuth()

  if (carregando) return <div className="p-4">Carregando perfil...</div>
  if (!usuario) return <div className="p-4 text-red-600">Erro ao carregar usuário.</div>

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-orange-700">Olá, {usuario.nome || 'Contratante'}!</h1>

        <div className="bg-white p-4 rounded-lg shadow space-y-2">
          {usuario.foto && (
            <img src={usuario.foto} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover mx-auto" />
          )}
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>CPF ou CNPJ:</strong> {usuario.cpfOuCnpj || 'Não informado'}</p>
          <p><strong>Endereço:</strong> {usuario.endereco || 'Não informado'}</p>
          <p><strong>Especialidade:</strong> {usuario.especialidade || 'Não informado'}</p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/contratante/editarperfil" className="text-orange-600 hover:underline">
            Editar Perfil
          </Link>
        </div>
      </div>

      <MenuInferiorContratante />
    </div>
  )
}
