import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import RotasApp from './routes'
import './styles/index.js'

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = React.useState(null)
  const [carregando, setCarregando] = React.useState(true)

  React.useEffect(() => {
    const dados = localStorage.getItem('usuarioLogado')
    if (dados) {
      try {
        setUsuarioLogado(JSON.parse(dados))
      } catch {
        setUsuarioLogado(null)
      }
    }
    setCarregando(false)
  }, [])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Carregando...
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <RotasApp usuario={usuarioLogado} />
      </div>
    </Router>
  )
}
