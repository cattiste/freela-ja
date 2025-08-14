import React from 'react'

export default function ProfissionalCardMini({ freela, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl px-3 py-3 border border-orange-100 shadow-sm cursor-pointer hover:shadow-md transition flex flex-col gap-2 w-full max-w-sm mx-auto"
    >
      <div className="flex items-center gap-3">
        <img
          src={freela.foto || '/placeholder-avatar.png'}
          alt={freela.nome}
          className="w-10 h-10 rounded-full object-cover border border-orange-200"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-orange-700">{freela.nome}</p>
            {freela.online !== undefined && (
              <span
                className={`text-[10px] font-semibold px-2 py-[2px] rounded-full ${
                  freela.online
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {freela.online ? 'Online' : 'Offline'}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600">
            {freela.funcao || 'Função não informada'}
            {freela.especialidade && ` / ${freela.especialidade}`}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-700 mt-1">
        <p><strong>Diária:</strong> R$ {freela.valorDiaria?.toFixed(2)}</p>
        <p><strong>Distância:</strong> {freela.distanciaKm != null ? `${freela.distanciaKm.toFixed(1)} km` : '—'}</p>
      </div>

      <button
        className="mt-2 w-full py-1.5 text-sm rounded-md bg-orange-600 hover:bg-orange-700 text-white"
        onClick={(e) => {
          e.stopPropagation()
          alert(`Chamada enviada para ${freela.nome}`)
          // Aqui você pode disparar a função real de chamada
        }}
      >
        Chamar
      </button>
    </div>
  )
}
