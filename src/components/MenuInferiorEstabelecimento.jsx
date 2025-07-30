// src/components/MenuInferiorEstabelecimento.jsx
import React from 'react'
import {
  UserCircle,
  Search,
  CalendarDays,
  Briefcase,
  Star,
  ScrollText,
  Settings,
  Signal
} from 'lucide-react'
import '@/styles/menuInferior.css'

const botoes = [
  { id: 'perfil', label: 'Perfil', icon: <UserCircle size={20} /> },
  { id: 'buscar', label: 'Buscar', icon: <Search size={20} /> },
  { id: 'ativas', label: 'Ativas', icon: <Signal size={20} /> }, // ✅ NOVA ABA
  { id: 'agendas', label: 'Agendas', icon: <CalendarDays size={20} /> },
  { id: 'vagas', label: 'Vagas', icon: <Briefcase size={20} /> },
  { id: 'avaliacao', label: 'Avaliar', icon: <Star size={20} /> },
  { id: 'historico', label: 'Histórico', icon: <ScrollText size={20} /> },
  { id: 'configuracoes', label: 'Config', icon: <Settings size={20} /> }
]

export default function MenuInferiorEstabelecimento({ onSelect, abaAtiva }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex justify-around py-2 z-50">
      {botoes.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex flex-col items-center text-xs font-medium transition ${
            abaAtiva === id ? 'text-orange-600' : 'text-gray-500'
          }`}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
              abaAtiva === id ? 'bg-orange-100' : 'bg-gray-100'
            }`}
          >
            {icon}
          </div>
          {label}
        </button>
      ))}
    </nav>
  )
}
