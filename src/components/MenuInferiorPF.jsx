// src/components/MenuInferiorPF.jsx
import React from 'react'
import { Home, Users2, ClipboardList, CalendarDays, PhoneCall } from 'lucide-react'
import '@/styles/menuInferior.css'

export default function MenuInferiorPF({ onSelect, abaAtiva }) {
  const botoes = [
    { key: 'perfil',    icone: <Home size={20} />,       titulo: 'Início' },
    { key: 'buscar',    icone: <Users2 size={20} />,     titulo: 'Buscar' },
    { key: 'chamadas',  icone: <PhoneCall size={20} />,  titulo: 'Chamadas' },
    { key: 'agenda',    icone: <CalendarDays size={20} />, titulo: 'Agenda' },
  ]

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-orange-200 shadow z-50 flex justify-around py-2"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
      {botoes.map((btn) => {
        const ativo = abaAtiva === btn.key
        return (
          <button
            key={btn.key}
            onClick={() => onSelect?.(btn.key)}
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
