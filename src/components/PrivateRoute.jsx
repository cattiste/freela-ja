import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="text-center mt-20 text-orange-600 font-bold">
        🔄 Verificando acesso...
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return children
}
