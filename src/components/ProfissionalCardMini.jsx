import React from 'react'

export default function ProfissionalCardMini({ freela, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl px-3 py-2 border border-orange-100 shadow-sm cursor-pointer hover:shadow-md transition flex items-center gap-3"
    >
      <img
        src={freela.foto || '/placeholder-avatar.png'}
        alt={freela.nome}
        className="w-10 h-10 rounded-full object-cover border border-orange-200"
      />

      <div className="flex-1">
        <p className="text-orange-700 font-semibold text-sm">{freela.nome}</p>
        <p className="text-xs text-gray-600">
          {freela.funcao || 'Função não informada'}
          {freela.especialidade && ` / ${freela.especialidade}`}
        </p>
        <div className="flex text-xs text-gray-600 mt-1 justify-between">
          <span>
            Distância:{' '}
            <strong>
              {freela.distanciaKm != null ? `${freela.distanciaKm.toFixed(1)} km` : '—'}
            </strong>
          </span>
          <span>
            R$ {freela.valorDiaria?.toFixed(2)}
          </span>
        </div>
      </div>

      {freela.online !== undefined && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
            freela.online
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {freela.online ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
}
