import React, { useState } from 'react'
import PerfilPF from './PerfilPF'
import PublicarEvento from './PublicarEvento'
import EventosAtivosPF from './EventosAtivosPF'
import CandidaturasPF from './CandidaturasPF'
import AvaliacoesRecebidasPF from './AvaliacoesRecebidasPF'
import BuscarFreelas from '@/components/BuscarFreelas'
import ConfigPF from './ConfigPF'
import PagamentoEvento from './PagamentoEvento' // novo import

export default function PainelPessoaFisica() {
  const [aba, setAba] = useState('perfil')
  const [eventoId, setEventoId] = useState(null)

  const renderizaAba = () => {
    switch (aba) {
      case 'perfil':
        return <PerfilPF />
      case 'eventos':
        return <EventosAtivosPF />
      case 'publicar':
        return <PublicarEvento setAba={setAba} setEventoId={setEventoId} />
      case 'pagamento':
        return <PagamentoEvento eventoId={eventoId} />
      case 'candidaturas':
        return <CandidaturasPF />
      case 'avaliacoes':
        return <AvaliacoesRecebidasPF />
      case 'buscar':
        return <BuscarFreelas tipoContratante="pf" />
      case 'config':
        return <ConfigPF />
      default:
        return <PerfilPF />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {renderizaAba()}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex justify-around py-2 z-50 text-xs">
        <button onClick={() => setAba('perfil')} className={aba === 'perfil' ? 'text-orange-600' : 'text-gray-500'}>Perfil</button>
        <button onClick={() => setAba('eventos')} className={aba === 'eventos' ? 'text-orange-600' : 'text-gray-500'}>Eventos</button>
        <button onClick={() => setAba('publicar')} className={aba === 'publicar' ? 'text-orange-600' : 'text-gray-500'}>Publicar</button>
        <button onClick={() => setAba('buscar')} className={aba === 'buscar' ? 'text-orange-600' : 'text-gray-500'}>Buscar Freela</button>
        <button onClick={() => setAba('candidaturas')} className={aba === 'candidaturas' ? 'text-orange-600' : 'text-gray-500'}>Candidatos</button>
        <button onClick={() => setAba('avaliacoes')} className={aba === 'avaliacoes' ? 'text-orange-600' : 'text-gray-500'}>Avaliações</button>
        <button onClick={() => setAba('config')} className={aba === 'config' ? 'text-orange-600' : 'text-gray-500'}>Configurações</button>
      </nav>
    </div>
  )
}
