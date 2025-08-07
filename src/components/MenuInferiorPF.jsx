
import React from 'react'
import {
  Home,
  Users2,
  ClipboardList,
  CalendarDays
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import '@/styles/menuInferior.css'

export default function MenuInferiorPF() {
  const navigate = useNavigate()
  const location = useLocation()

  const botoes = [
    { rota: '/pf', icone: <Home size={20} />, titulo: 'Início' },
    { rota: '/pf/buscar', icone: <Users2 size={20} />, titulo: 'Buscar' },
    { rota: '/pf/candidaturas', icone: <ClipboardList size={20} />, titulo: 'Candidatos' },
    { rota: '/pf/agenda', icone: <CalendarDays size={20} />, titulo: 'Agenda' }
  ]

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-orange-200 shadow z-50 flex justify-around py-2">
      {botoes.map((btn, index) => {
        const ativo = location.pathname === btn.rota
        return (
          <button
            key={index}
            onClick={() => navigate(btn.rota)}
            className={`flex flex-col items-center gap-1 text-xs ${ativo ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}
          >
            {btn.icone}
            {btn.titulo}
          </button>
        )
      })}
    </div>
  )
}
