// src/components/VagasEstabelecimentoCompleto.jsx
import React, { useState } from 'react'
import PublicarVaga from '@/pages/estabelecimento/PublicarVaga'
import MinhasVagas from '@/components/MinhasVagas'
import CandidaturasEstabelecimento from '@/components/CandidaturasEstabelecimento'

export default function VagasEstabelecimentoCompleto({ estabelecimento }) {
  const [tab, setTab] = useState('publicar')
  const [vagaEditando, setVagaEditando] = useState(null)

  const handleSalvarSucesso = () => {
    setVagaEditando(null)
  }

  return (
    <div className="space-y-6">
      {/* Sub-navegação interna */}
      <div className="flex space-x-4 border-b border-gray-200 mb-4">
        <button
          onClick={() => { setTab('publicar'); setVagaEditando(null) }}
          className={`px-4 py-2 font-semibold ${
            tab === 'publicar'
              ? 'border-b-2 border-orange-600 text-orange-600'
              : 'text-white-500 hover:text-orange-600'
          }`}
        >
          Publicar Vaga
        </button>
        <button
          onClick={() => setTab('minhas')}
          className={`px-4 py-2 font-semibold ${
            tab === 'minhas'
              ? 'border-b-2 border-orange-600 text-orange-600'
              : 'text-white-500 hover:text-orange-600'
          }`}
        >
          Minhas Vagas
        </button>
        <button
          onClick={() => setTab('candidaturas')}
          className={`px-4 py-2 font-semibold ${
            tab === 'candidaturas' &&
              ? 'border-b-2 border-orange-600 text-orange-600'
              : 'text-cyan-500 hover:text-orange-600'
          }`}
        >
          Candidaturas
        </button>
      </div>

      {/* Conteúdo de cada sub-aba */}
      <div>
        {tab === 'publicar' && (
          <PublicarVaga
            estabelecimento={estabelecimento}
            vaga={vagaEditando}
            onSucesso={handleSalvarSucesso}
          />
        )}
        {tab === 'minhas' && (
          <MinhasVagas
            estabelecimento={estabelecimento}
            onEditar={(vaga) => {
              setVagaEditando(vaga)
              setTab('publicar')
            }}
          />
        )}
        {tab === 'candidaturas' && (
          <CandidaturasEstabelecimento estabelecimentoUid={estabelecimento.uid} />
        )}
      </div>
    </div>
  )
}
