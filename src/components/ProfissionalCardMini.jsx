// src/components/ProfissionalCardMini.jsx
import React from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { MdOutlineAttachMoney } from 'react-icons/md'
import { GoDotFill } from 'react-icons/go'

export default function ProfissionalCardMini({ freela, onChamar, onClick }) {
  const {
    nome,
    funcao,
    especialidades,
    valorDiaria,
    distancia,
    foto,
    online
  } = freela || {}

  return (
    <div className="bg-white rounded-xl shadow p-3 w-full max-w-xs flex flex-col items-center relative hover:shadow-md transition">
      {/* Foto e status online */}
      <div className="relative">
        <img
          src={foto || 'https://via.placeholder.com/100'}
          alt="Foto do freela"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div className={`absolute top-0 right-0 flex items-center text-sm font-semibold ${
          online ? 'text-green-600' : 'text-gray-400'
        }`}>
          <GoDotFill className="text-lg" />
        </div>
      </div>

      {/* Conteúdo (clique abre modal) */}
      <div onClick={onClick} className="mt-3 w-full cursor-pointer text-center">
        <h3 className="font-bold text-base text-gray-800">{nome}</h3>
        <p className="text-sm text-gray-600">{funcao}</p>
        {especialidades?.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {Array.isArray(especialidades) ? especialidades.join(', ') : especialidades}
          </p>
        )}
        {valorDiaria !== undefined && (
          <div className="text-orange-600 font-semibold flex items-center justify-center mt-1 text-sm">
            <MdOutlineAttachMoney className="mr-1" />
            {valorDiaria?.toFixed(2)}
          </div>
        )}
        {distancia !== undefined && (
          <div className="text-gray-600 flex items-center justify-center mt-1 text-xs">
            <FaMapMarkerAlt className="mr-1" />
            {distancia.toFixed(1)} km
          </div>
        )}
      </div>

      {/* Botão Chamar */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onChamar?.(freela)
        }}
        className="mt-3 bg-orange-600 hover:bg-orange-700 text-white text-sm py-1 px-3 rounded-full transition"
      >
        Chamar
      </button>
    </div>
  )
}
