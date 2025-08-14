// src/components/MenuInferiorContratante.jsx
import React from 'react'
import { User, Search, PhoneCall, Clock, Settings } from 'lucide-react'

export default function MenuInferiorContratante({ aba, setAba }) {
  const botoes = [
    { id: 'perfil', icone: <User />, texto: 'Perfil' },
    { id: 'buscar', icone: <Search />, texto: 'Buscar' },
    { id: 'chamadas', icone: <PhoneCall />, texto: 'Chamadas' },
    { id: 'historico', icone: <Clock />, texto: 'Histórico' },
    { id: 'config', icone: <Settings />, texto: 'Config' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
      {botoes.map((btn) => (
        <button
          key={btn.id}
          onClick={() => setAba(btn.id)}
          className={`flex flex-col items-center text-xs ${aba === btn.id ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}
        >
          {btn.icone}
          {btn.texto}
        </button>
      ))}
    </nav>
  )
}
