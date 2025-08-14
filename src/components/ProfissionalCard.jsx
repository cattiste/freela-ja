import React, { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ProfissionalCard({ freela, usuario, emChamada }) {
  const [enviando, setEnviando] = useState(false)

  async function chamar() {
    if (!usuario?.uid) return
    setEnviando(true)
    const id = `${usuario.uid}_${Date.now()}`
    await setDoc(doc(db, 'chamadas', id), {
      idPersonalizado: id,
      estabelecimentoUid: usuario.uid,
      estabelecimentoNome: usuario.nome || '',
      freelaUid: freela.id,
      freelaNome: freela.nome || '',
      valorDiaria: freela.valorDiaria || 0,
      estabelecimentoLocalizacao: usuario.localizacao || null,
      freelaLocalizacao: freela.localizacao || null,
      status: 'pendente',
      criadoEm: serverTimestamp(),
    })
    setEnviando(false)
    alert(`Chamada enviada para ${freela.nome}`)
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-orange-100 shadow-sm space-y-2">
      <div className="flex items-center gap-3">
        <img
          src={freela.foto || '/placeholder-avatar.png'}
          alt={freela.nome}
          className="w-12 h-12 rounded-full object-cover border border-orange-200"
        />
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-orange-700 font-semibold text-sm">{freela.nome}</span>
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
          <span className="text-xs text-gray-600">
            {freela.funcao || 'Função não informada'}
            {freela.especialidade && ` / ${freela.especialidade}`}
          </span>
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
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

      <button
        onClick={chamar}
        disabled={enviando || emChamada}
        className={`w-full py-1.5 text-sm rounded-md transition ${
          emChamada
            ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
            : 'bg-orange-600 hover:bg-orange-700 text-white'
        }`}
      >
        {emChamada ? 'Chamada em andamento' : enviando ? 'Enviando...' : 'Chamar'}
      </button>
    </div>
  )
}
