import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/gerais/Home'
import Sobre from '@/pages/gerais/Sobre'
// ...

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sobre" element={<Sobre />} />
      {/* outras rotas */}
    </Routes>
  )
}
