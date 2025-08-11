// src/components/RequireRole.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireRole({ allow = [], children }) {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/login" replace />

  const role = usuario.role || usuario.tipo || usuario.tipoUsuario
  if (allow.length && !allow.includes(role)) return <Navigate to="/" replace />

  return children
}
