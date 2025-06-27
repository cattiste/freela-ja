import React, { useState } from 'react'
import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('buscar')

  const renderConteudo = () => {
    switch (aba) {
      case 'buscar': return <BuscarFreelas />
      case 'chamadas': return <ChamadasEstabelecimento />
      case 'agendas': return <AgendasContratadas />
      case 'avaliacao': return <AvaliacaoFreela />
      default: return <BuscarFreelas />
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">📊 Painel do Estabelecimento</h1>

        {/* Navegação por abas */}
        <div className="flex gap-4 mb-6 border-b pb-2">
          <button onClick={() => setAba('buscar')} className={`btn-secondary ${aba === 'buscar' && 'bg-orange-600 text-white'}`}>🔍 Buscar Freelancers</button>
          <button onClick={() => setAba('chamadas')} className={`btn-secondary ${aba === 'chamadas' && 'bg-orange-600 text-white'}`}>📞 Chamadas</button>
          <button onClick={() => setAba('agendas')} className={`btn-secondary ${aba === 'agendas' && 'bg-orange-600 text-white'}`}>📅 Agendas</button>
          <button onClick={() => setAba('avaliacao')} className={`btn-secondary ${aba === 'avaliacao' && 'bg-orange-600 text-white'}`}>⭐ Avaliar</button>
        </div>

        {/* Conteúdo da aba */}
        {renderConteudo()}
      </div>
    </div>
  )
}
