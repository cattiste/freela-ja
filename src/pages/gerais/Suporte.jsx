// src/pages/gerais/Suporte.jsx
import React from 'react'
import ChatbotSuporte from '@/components/ChatbotSuporte'
import ChatHumano from '@/components/ChatHumano'

export default function Suporte() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Central de Suporte</h1>

      <p className="mb-4">
        Seja bem-vindo à Central de Suporte do <strong>Freela Já</strong>. Aqui você pode tirar dúvidas,
        falar com nosso assistente virtual ou entrar em contato com nosso time humano.
      </p>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-1">📩 E-mail de contato</h2>
        <p>
          Em caso de dúvidas, você também pode nos enviar um e-mail para:{' '}
          <a href="mailto:contato@freelaja.com.br" className="text-blue-600 underline">
            contato@freelaja.com.br
          </a>
        </p>
      </div>

      <div className="mb-6">
        <ChatbotSuporte />
      </div>

      <div className="mb-6">
        <ChatHumano />
      </div>
    </div>
  )
}
