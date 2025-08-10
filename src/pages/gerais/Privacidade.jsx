// src/pages/gerais/Privacidade.jsx
import React from 'react'

export default function Privacidade() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Política de Privacidade</h1>
      <p className="mb-3">
        Tratamos seus dados conforme a Lei 13.709/2018 (LGPD). Coletamos dados necessários para:
        criação de conta, verificação de identidade, execução de chamadas, processamento de pagamentos,
        prevenção a fraudes e atendimento. Compartilhamos estritamente com operadores essenciais (ex.: meios de pagamento).
      </p>
      <h2 className="font-semibold mt-4 mb-2">Bases legais</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>Execução de contrato</li>
        <li>Cumprimento de obrigação legal/regulatória</li>
        <li>Legítimo interesse (antifraude/segurança)</li>
        <li>Consentimento quando aplicável</li>
      </ul>
      <h2 className="font-semibold mt-4 mb-2">Direitos do titular</h2>
      <p className="mb-3">
        Acesso, correção, portabilidade e exclusão, observadas retenções legais e prevenção a fraudes.
        Solicitações podem ser feitas pelo contato indicado no app.
      </p>
      <h2 className="font-semibold mt-4 mb-2">Segurança</h2>
      <p className="mb-3">Empregamos medidas técnicas e organizacionais proporcionais, incluindo logs, validação de presença e monitoramento antifraude.</p>
      <p className="text-xs text-gray-500">Última atualização: 10/08/2025.</p>
    </div>
  )
}
