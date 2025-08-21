// src/auth/RequireAdmin.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireAdmin({ children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) return <p>Carregando...</p>

  if (!usuario || usuario.tipo !== 'admin') {
    return <Navigate to="/acesso-negado" replace />
  }

  return children
}
