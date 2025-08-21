// src/components/RequireAdmin.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireAdmin({ children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return <div className="p-4 text-center">Carregando...</div>
  }

  if (!usuario || usuario.tipo !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
