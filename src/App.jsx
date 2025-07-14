// 📄 src/App.jsx
import React from 'react'
import RotasApp from './routes/RotasApp'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="text-center mt-20 text-orange-600 font-bold">
        🔄 Carregando...
      </div>
    )
  }

  return <RotasApp usuario={usuario} />
}
