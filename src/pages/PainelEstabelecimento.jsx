import React, { useState } from 'react'
import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'

export default function PainelEstabelecimento({ estabelecimento }) {
  const [aba, setAba] = useState('buscar')

  const renderConteudo = () => {
    switch (aba) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} />
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacaoFreela estabelecimento={estabelecimento} />
      default:
        return <BuscarFreelas estabelecimento={estabelecimento} />
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">📊 Painel do Estabelecimento</h1>

        <div className="flex gap-4 mb-6 border-b pb-2">
          <button
            onClick={() => setAba('buscar')}
            className={`btn-secondary ${aba === 'buscar' ? 'bg-orange-600 text-white' : ''}`}
          >
            🔍 Buscar Freelancers
          </button>
          <button
            onClick={() => setAba('chamadas')}
            className={`btn-secondary ${aba === 'chamadas' ? 'bg-orange-600 text-white' : ''}`}
          >
            📞 Chamadas
          </button>
          <button
            onClick={() => setAba('agendas')}
            className={`btn-secondary ${aba === 'agendas' ? 'bg-orange-600 text-white' : ''}`}
          >
            📅 Agendas
          </button>
          <button
            onClick={() => setAba('avaliacao')}
            className={`btn-secondary ${aba === 'avaliacao' ? 'bg-orange-600 text-white' : ''}`}
          >
            ⭐ Avaliar
          </button>
        </div>

        {renderConteudo()}
      </div>
    </div>
  )
}
