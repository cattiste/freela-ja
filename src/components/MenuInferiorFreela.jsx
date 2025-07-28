// src/components/MenuInferiorFreela.jsx

import React from 'react'
import {
  UserCircle,
  Calendar,
  Star,
  PhoneCall,
  Wallet,
  Settings
} from 'lucide-react'
import '@/styles/menuInferior.css' // Importa seus estilos customizados

const botoes = [
  { id: 'perfil', label: 'Perfil', icon: <UserCircle size={20} /> },
  { id: 'chamadas', label: 'Chamadas', icon: <PhoneCall size={20} /> },
  { id: 'agendaCompleta', label: 'Agenda', icon: <Calendar size={20} /> }, // ✅ novo botão
  { id: 'avaliacoes', label: 'Avaliações', icon: <Star size={20} /> },
  { id: 'recebimentos', label: 'Recebimentos', icon: <Wallet size={20} /> },
  { id: 'config', label: 'Config', icon: <Settings size={20} /> }
]


export default function MenuInferiorFreela({ onSelect, abaAtiva, alertas = {} }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex justify-around py-2 z-50">
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
