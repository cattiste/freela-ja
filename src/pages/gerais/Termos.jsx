// src/pages/gerais/Termos.jsx
import React from 'react'

export default function Termos() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Termos de Uso</h1>
      <p className="mb-3">
        A Freela Já intermedeia contratações no segmento de alimentos, bebidas e eventos. O uso implica
        aceitação destes Termos, do Contrato de Prestação de Serviços e da Política de Privacidade.
      </p>

      <h2 className="font-semibold mt-4 mb-2">Pagamentos e Taxas</h2>
      <p className="mb-3">
        Fluxo atual via PIX (e futuramente cartão). A plataforma pode reter até 20% (10% do contratante +
        10% do freelancer), liberando ao final (check-out), conforme regras exibidas no app.
      </p>

      <h2 className="font-semibold mt-4 mb-2">Conduta e Conteúdo</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>Dados exatos e atualização cadastral</li>
        <li>Proibição de fraude, assédio e conteúdo ilegal</li>
        <li>Respeito às condições combinadas nas chamadas</li>
      </ul>

      <h2 className="font-semibold mt-4 mb-2">Responsabilidade</h2>
      <p className="mb-3">
        A plataforma não responde pela execução do serviço entre as partes, nem por perdas indiretas.
        Limites conforme legislação aplicável.
      </p>

      <h2 className="font-semibold mt-4 mb-2">Atualizações</h2>
      <p className="mb-3">Podemos atualizar estes Termos; o uso contínuo após a publicação implica concordância.</p>

      <p className="text-xs text-gray-500">Última atualização: 10/08/2025.</p>
    </div>
  )
}
