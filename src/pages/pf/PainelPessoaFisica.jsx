// src/pages/pf/PainelPessoaFisica.jsx
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

import BuscarFreelas from '@/components/BuscarFreelas'
import ChamadasPessoaFisica from './ChamadasPessoaFisica'
import AgendasContratadas from './AgendaEventosPF'
import AvaliacoesRecebidasPF from './AvaliacoesRecebidasPF'
import MenuInferiorPF from '@/components/MenuInferiorPF'

export default function PainelPessoaFisica() {
  const { usuario, carregando } = useAuth()
  const [abaAtual, setAbaAtual] = useState('perfil')

  if (carregando || !usuario) {
    return <div className="p-4 text-center text-gray-500">Carregando painel...</div>
  }

  return (
    <div className="pb-24">
      {/* 🧡 Aba de Perfil */}
      {abaAtual === 'perfil' && (
        <div className="p-4 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border border-orange-100 flex items-center gap-4">
            <img
              src={usuario.foto || 'https://via.placeholder.com/100'}
              alt={usuario.nome}
              className="w-20 h-20 rounded-full object-cover border-2 border-orange-300"
            />
            <div>
              <p className="text-lg font-bold text-orange-700">{usuario.nome}</p>
              <p className="text-sm text-gray-600">{usuario.celular}</p>
              <p className="text-sm text-gray-600">{usuario.email}</p>
            </div>
          </div>

          <AgendasContratadas estabelecimento={usuario} />
          <AvaliacoesRecebidasPF freela={usuario} />
        </div>
      )}

      {/* 🔍 Aba de Buscar Freelas */}
      {abaAtual === 'buscar' && <BuscarFreelas usuario={usuario} />}

      {/* 📞 Aba de Chamadas */}
      {abaAtual === 'chamadas' && <ChamadasPessoaFisica usuario={usuario} />}

      {/* ⚙️ Configurações */}
      {abaAtual === 'config' && (
        <div className="p-4 text-center text-gray-500">Configurações em breve.</div>
      )}

      {/* ⬇️ Menu de navegação inferior */}
      <MenuInferiorPF abaAtual={abaAtual} setAbaAtual={setAbaAtual} />
    </div>
  )
}
