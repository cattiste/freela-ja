// ✅ src/components/MenuInferiorEstabelecimento.jsx

import React from 'react'
import {
  Search,
  CalendarCheck2,
  Briefcase,
  Star,
  ScrollText,
  Settings
} from 'lucide-react'
import '@/styles/menuInferior.css' // ✅ usa mesmo estilo do freela

const botoes = [
  { id: 'buscar', label: 'Buscar', icon: <Search size={20} /> },
  { id: 'agendas', label: 'Agendas', icon: <CalendarCheck2 size={20} /> },
  { id: 'vagas', label: 'Vagas', icon: <Briefcase size={20} /> },
  { id: 'avaliacao', label: 'Avaliar', icon: <Star size={20} /> },
  { id: 'historico', label: 'Histórico', icon: <ScrollText size={20} /> },
  { id: 'configuracoes', label: 'Config', icon: <Settings size={20} /> }
]

export default function MenuInferiorEstabelecimento({ onSelect, abaAtiva, alertas = {} }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex justify-around py-2 z-50 md:hidden">
      {botoes.map(({ id, label, icon }) => {
        const alertaAtivo = alertas[id]
        return (
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
              } ${alertaAtivo ? 'alerta-icone' : ''}`}
            >
              {icon}
            </div>
            {label}
          </button>
        )
      })}
    </nav>
  )
}
