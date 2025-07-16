import React, { useState } from 'react'
import ConfiguracoesEstabelecimento from './ConfiguracoesEstabelecimento'
import PagamentosEstabelecimento from './PagamentosEstabelecimento'

export default function ConfigPagamentoEstabelecimento({ usuario }) {
  const [aba, setAba] = useState('configuracoes')

  const renderConteudo = () => {
    switch (aba) {
      case 'configuracoes':
        return <ConfiguracoesEstabelecimento estabelecimento={usuario} />
      case 'pagamentos':
        return <PagamentosEstabelecimento estabelecimento={usuario} />
      default:
        return <ConfiguracoesEstabelecimento estabelecimento={usuario} />
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <nav className="border-b border-orange-300 mb-6">
          <ul className="flex space-x-4">
            <li>
              <button
                onClick={() => setAba('configuracoes')}
                className={`px-4 py-2 font-semibold border-b-2 transition ${
                  aba === 'configuracoes'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-orange-600'
                }`}
              >
                ⚙️ Configurações
              </button>
            </li>
            <li>
              <button
                onClick={() => setAba('pagamentos')}
                className={`px-4 py-2 font-semibold border-b-2 transition ${
                  aba === 'pagamentos'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-orange-600'
                }`}
              >
                💳 Pagamentos
              </button>
            </li>
          </ul>
        </nav>
        <section>
          {renderConteudo()}
        </section>
      </div>
    </div>
  )
}
