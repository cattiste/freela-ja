import React from 'react'

export default function ProfissionalCardMini({ freela, onClick, onChamar }) {
  if (!freela) return null

  const {
    nome,
    funcao,
    especialidade,
    valorDiaria,
    fotoURL,
    online = false,
  } = freela

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition relative"
      style={{ maxWidth: 320 }}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <img
          src={fotoURL || 'https://via.placeholder.com/100'}
          alt={nome}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
        />
        <div className="font-semibold text-gray-900">{nome}</div>
        <div className="text-sm text-gray-600">{funcao}</div>
        {especialidade && (
          <div className="text-xs text-gray-500 italic -mt-1">{especialidade}</div>
        )}
        <div className="text-green-600 text-sm font-medium mt-1">
          {online ? '🟢 Online agora' : '⚪ Offline'}
        </div>
        <div className="text-sm text-gray-700">
          💰 R$ {Number(valorDiaria || 0).toFixed(2)}
        </div>

        {onChamar && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onChamar(freela)
            }}
            className="mt-2 px-4 py-1 text-sm font-medium bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
          >
            Chamar
          </button>
        )}
      </div>
    </div>
  )
}