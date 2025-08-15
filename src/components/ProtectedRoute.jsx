// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { usuario, carregando } = useAuth()

  if (carregando) return null // ou um spinner leve

  if (!usuario?.uid) return <Navigate to="/login" replace />

  if (role && usuario?.tipo !== role) {
    // Redireciona para o painel correto do usuário
    if (usuario?.tipo === 'contratante') return <Navigate to="/painelcontratante" replace />
    if (usuario?.tipo === 'freela') return <Navigate to="/painelfreela" replace />
    if (usuario?.tipo === 'pessoa_fisica') return <Navigate to="/painelpf" replace />
    return <Navigate to="/" replace />
  }

  return children
}
