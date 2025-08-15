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
    <div
      className="bg-white rounded-lg shadow p-3 w-full max-w-[280px] flex flex-col items-center relative hover:shadow-md transition"
    >
      {/* Foto e status */}
      <div className="relative flex items-center">
        <img
          src={foto || 'https://via.placeholder.com/100'}
          alt="Foto do freela"
          className="w-16 h-16 rounded-full object-cover border"
        />
        <div className="ml-2 text-sm font-medium flex items-center space-x-1">
          <GoDotFill className={`text-lg ${online ? 'text-green-500' : 'text-gray-400'}`} />
          <span className={online ? 'text-green-600' : 'text-gray-500'}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Conteúdo clicável (abre modal) */}
      <div onClick={onClick} className="mt-3 text-center cursor-pointer w-full">
        <h3 className="font-bold text-base text-gray-800">{nome}</h3>
        <p className="text-sm text-gray-600">{funcao}</p>

        {especialidades?.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {Array.isArray(especialidades)
              ? especialidades.join(', ')
              : especialidades}
          </p>
        )}

        {/* Valor da diária */}
        {valorDiaria !== undefined && (
          <div className="text-orange-600 font-semibold mt-2 text-sm">
            Diária: R$ {valorDiaria?.toFixed(2)}
          </div>
        )}

        {/* Distância */}
        {distancia !== undefined && (
          <div className="text-gray-600 flex justify-center items-center mt-1 text-xs">
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
        className="mt-3 bg-orange-600 hover:bg-orange-700 text-white text-sm py-1 px-4 rounded-full transition"
      >
        Chamar
      </button>
    </div>
  )
}
