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
  { id: 'historico', label: 'Histórico', icon: <ScrollText size={20} /> }
  
]

export default function MenuInferiorEstabelecimento({ onSelect, abaAtiva }) {
  return (
    <nav className="menu-inferior">
      {botoes.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`menu-item ${abaAtiva === id ? 'active' : ''}`}
        >
          <div className="menu-icon-container">
            {React.cloneElement(icon, {
              className: abaAtiva === id ? 'text-orange-600' : 'text-gray-500'
            })}
          </div>
          {label}
        </button>
      ))}
    </nav>
  )
}