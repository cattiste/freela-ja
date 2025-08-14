// src/components/ProfissionalCardMini.jsx
import React from 'react'

export default function ProfissionalCardMini({ freela, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-3 border border-orange-100 shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-orange-700 font-semibold text-sm">{freela.nome}</p>
          <p className="text-xs text-gray-600">
            {freela.funcao || 'Função não informada'}
            {freela.especialidade && ` / ${freela.especialidade}`}
          </p>
        </div>
        {freela.online !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              freela.online
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {freela.online ? 'Online' : 'Offline'}
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600 flex justify-between">
        <span>
          Distância:{' '}
          <strong>
            {freela.distanciaKm != null ? `${freela.distanciaKm.toFixed(1)} km` : '—'}
          </strong>
        </span>
        <span>
          Diária: <strong>R$ {freela.valorDiaria?.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  )
}
