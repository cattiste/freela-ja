
// src/components/ProfissionalCardMini.jsx
import React from 'react'

export default function ProfissionalCardMini({ freela, onClick, onChamar }) {
  const {
    nome, funcao, especialidade, valorDiaria, distanciaKm, online, foto
  } = freela || {}

  return (
    <div
      className="bg-white border rounded-xl shadow-sm px-4 py-3 cursor-pointer hover:shadow-md transition flex flex-col items-center text-center w-full max-w-xs mx-auto"
      onClick={onClick}
    >
      <img
        src={foto || 'https://via.placeholder.com/100'}
        alt={nome || 'Freela'}
        className="w-16 h-16 rounded-full object-cover border-2 border-orange-400 shadow mb-1"
      />

      <div className="text-sm font-bold text-gray-800">{nome || 'Sem nome'}</div>
      <div className="text-xs text-gray-600">{funcao || 'Função indefinida'}</div>
      {especialidade && (
        <div className="text-xs text-gray-500 italic">{especialidade}</div>
      )}

      {valorDiaria && (
        <div className="text-green-600 font-bold text-sm mt-1">
          💰 R$ {Number(valorDiaria).toFixed(2)}
        </div>
      )}

      {typeof distanciaKm === 'number' && (
        <div className="text-blue-500 text-xs mt-1">
          📍 {distanciaKm.toFixed(1)} km
        </div>
      )}

      <div className="flex items-center justify-center gap-1 text-xs mt-1">
        <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className={online ? 'text-green-700' : 'text-gray-500'}>
          {online ? 'Online agora' : 'Offline'}
        </span>
      </div>

      {onChamar && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onChamar()
          }}
          className="mt-2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs hover:bg-orange-600"
        >
          📩 Chamar
        </button>
      )}
    </div>
  )
}
