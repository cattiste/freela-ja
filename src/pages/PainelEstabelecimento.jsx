import React, { useState } from 'react'

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('buscar')

  return (
    <div style={{ padding: 20 }}>
      <h1>Painel Estabelecimento Básico</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setAba('buscar')} disabled={aba === 'buscar'}>
          Buscar Freelancers
        </button>
        <button onClick={() => setAba('chamadas')} disabled={aba === 'chamadas'}>
          Chamadas
        </button>
        <button onClick={() => setAba('agendas')} disabled={aba === 'agendas'}>
          Agendas
        </button>
        <button onClick={() => setAba('avaliacao')} disabled={aba === 'avaliacao'}>
          Avaliação
        </button>
      </div>

      <div>
        {aba === 'buscar' && <div>📋 Conteúdo: Buscar Freelancers</div>}
        {aba === 'chamadas' && <div>📞 Conteúdo: Chamadas</div>}
        {aba === 'agendas' && <div>📅 Conteúdo: Agendas</div>}
        {aba === 'avaliacao' && <div>⭐ Conteúdo: Avaliação</div>}
      </div>
    </div>
  )
}
