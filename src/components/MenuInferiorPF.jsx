// src/components/MenuInferiorPF.jsx
import React from 'react'
import { Home, Users2, ClipboardList, CalendarDays, PhoneCall } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import '@/styles/menuInferior.css'

export default function MenuInferiorPF() {
  const navigate = useNavigate()
  const location = useLocation()

  const botoes = [
    { rota: '/pf',            icone: <Home size={20} />,         titulo: 'Início' },
    { rota: '/pf/buscar',     icone: <Users2 size={20} />,       titulo: 'Buscar' },
    { rota: '/pf/chamadas',   icone: <PhoneCall size={20} />,    titulo: 'Chamadas' }, // ✅ novo
    { rota: '/pf/agenda',     icone: <CalendarDays size={20} />, titulo: 'Agenda' }
  ]

  // ativo se a rota atual começa com a rota do botão (cobre rotas-filhas, ex.: /pf/chamadas/123)
  const isAtivo = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-white border-t border-orange-200 shadow z-50 flex justify-around py-2"
      style={{
        // evita sobrepor em aparelhos com notch / gestos
        paddingBottom: 'env(safe-area-inset-bottom, 0)'
      }}
    >
      {botoes.map((btn, index) => {
        const ativo = isAtivo(btn.rota)
        return (
          <button
            key={index}
            onClick={() => navigate(btn.rota)}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              ativo ? 'text-orange-600 font-semibold' : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-current={ativo ? 'page' : undefined}
          >
            {btn.icone}
            {btn.titulo}
          </button>
        )
      })}
    </div>
  )
}
