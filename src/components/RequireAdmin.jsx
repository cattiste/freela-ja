// src/components/RequireAdmin.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireAdmin({ children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) return null
  if (!usuario || usuario.tipo !== 'admin') return <Navigate to="/acesso-negado" />
  return children
}
