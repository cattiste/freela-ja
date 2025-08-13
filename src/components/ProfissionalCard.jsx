// ProfissionalCard.jsx
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
    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow">
      <div className="flex items-center gap-4">
        <img
          src={freela.foto || '/placeholder-avatar.png'}
          alt={freela.nome}
          className="w-14 h-14 rounded-full object-cover border border-orange-200"
        />
        <div>
          <h3 className="text-orange-700 font-semibold">{freela.nome}</h3>
          <p className="text-sm text-gray-600">
            {freela.funcao || 'Função não informada'}
          </p>
          <div className="flex gap-3 text-sm mt-1">
            <span className="px-2 py-1 rounded-md bg-gray-100">
              Distância:{' '}
              <strong>
                {freela.distancia != null
                  ? `${freela.distancia.toFixed(1)} km`
                  : '—'}
              </strong>
            </span>
            <span className="px-2 py-1 rounded-md bg-orange-100">
              Diária: <strong>R$ {freela.valorDiaria?.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {emChamada ? (
          <button
            disabled
            className="w-full py-2 rounded-lg bg-green-50 text-green-700 border border-green-200"
          >
            Chamada em andamento
          </button>
        ) : (
          <button
            onClick={chamar}
            disabled={enviando}
            className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
          >
            {enviando ? 'Enviando...' : 'Chamar'}
          </button>
        )}
      </div>
    </div>
  )
}
