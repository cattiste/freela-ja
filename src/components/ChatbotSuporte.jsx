// src/components/ChatbotSuporte.jsx
import React, { useState } from 'react'

const perguntasRespostas = [
  {
    pergunta: 'Como faço meu cadastro?',
    resposta: 'Você pode se cadastrar na página inicial clicando em "Criar Conta" e escolhendo se é Freela, Estabelecimento ou Pessoa Física.',
  },
  {
    pergunta: 'Como contratar um freela?',
    resposta: 'Entre no painel (estabelecimento ou pessoa física), vá até "Buscar Freelas", selecione um profissional e clique em "Chamar".',
  },
  {
    pergunta: 'Como funciona o pagamento?',
    resposta: 'O pagamento pode ser feito via Pix ou cartão. O valor fica retido até o trabalho ser concluído, garantindo segurança para todos.',
  },
  {
    pergunta: 'O que é o check-in e check-out?',
    resposta: 'O check-in confirma a chegada do freela no local. O check-out confirma que ele terminou o serviço. Ambos são obrigatórios para liberar o pagamento.',
  },
  {
    pergunta: 'Quais são as taxas da plataforma?',
    resposta: 'A plataforma retém 10% do contratante e 10% do freela, totalizando 20% por transação. Isso cobre custos de operação e segurança.',
  },
]

export default function ChatbotSuporte() {
  const [respostaSelecionada, setRespostaSelecionada] = useState(null)

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2">🤖 Assistente Virtual (FAQ)</h2>
      {perguntasRespostas.map((item, index) => (
        <div key={index} className="mb-2">
          <button
            className="text-left w-full text-blue-600 font-medium hover:underline"
            onClick={() => setRespostaSelecionada(index)}
          >
            {item.pergunta}
          </button>
          {respostaSelecionada === index && (
            <p className="text-sm mt-1 text-gray-700">{item.resposta}</p>
          )}
        </div>
      ))}
    </div>
  )
}
