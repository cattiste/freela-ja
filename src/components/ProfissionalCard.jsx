import React from 'react'

export default function ProfissionalCard({
  prof,
  online = false,
  distanciaKm = null,
  hasChamadaAtiva = false,
  onChamar,
  chamandoUid,
  AvatarFallback // opcional, vindo do BuscarFreelas p/ manter o mesmo visual
}) {
  const foto = prof?.foto && typeof prof.foto === 'string' ? prof.foto : null
  const distanciaFmt = distanciaKm == null
    ? '—'
    : `${distanciaKm.toFixed(distanciaKm < 10 ? 1 : 0)} km`
  const statusPill = online ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'

  const desabilitaBotao = hasChamadaAtiva || (chamandoUid && chamandoUid === prof.id)

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md border border-orange-100 hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        {foto ? (
          <img
            src={foto}
            alt={prof?.nome || 'Freela'}
            className="w-16 h-16 rounded-full object-cover border-2 border-orange-300"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          AvatarFallback ? <AvatarFallback className="w-16 h-16" /> : null
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-orange-700">{prof?.nome || 'Freelancer'}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusPill}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            {prof?.funcao || 'Função não informada'}
            {prof?.especialidade ? ` • ${prof.especialidade}` : ''}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <span className="px-2 py-1 rounded-md bg-orange-50 border border-orange-200">
              Distância: <strong>{distanciaFmt}</strong>
            </span>
            {typeof prof?.valorDiaria === 'number' && (
              <span className="px-2 py-1 rounded-md bg-orange-50 border border-orange-200">
                Diária: <strong>R$ {prof.valorDiaria.toFixed(2)}</strong>
              </span>
            )}
            {typeof prof?.avaliacaoMedia === 'number' && (
              <span className="px-2 py-1 rounded-md bg-yellow-50 border border-yellow-200">
                ⭐ {prof.avaliacaoMedia.toFixed(1)}
              </span>
            )}
          </div>

          {/* Botão mantém o MESMO visual. A lógica foi ajustada: */}
          {!hasChamadaAtiva ? (
            <button
              onClick={onChamar}
              disabled={desabilitaBotao}
              className={`mt-3 px-4 py-2 rounded-lg transition text-white ${desabilitaBotao ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
              title="Criar chamada para este freela"
            >
              {chamandoUid === prof.id ? 'Enviando…' : 'Chamar'}
            </button>
          ) : (
            <div className="mt-3 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-center">
              Chamada em andamento
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
