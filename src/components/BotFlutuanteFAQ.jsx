import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'

const perguntasRespostas = [
  {
    pergunta: 'Como faço meu cadastro?',
    resposta: 'Você pode se cadastrar na página inicial clicando em "Criar Conta" e escolhendo se é Freela, Estabelecimento ou Pessoa Física.',
  },
  {
    pergunta: 'Como contratar um freela?',
    resposta: 'Entre no painel, vá até "Buscar Freelas", selecione um profissional e clique em "Chamar".',
  },
  {
    pergunta: 'Como funciona o pagamento?',
    resposta: 'O pagamento pode ser feito via Pix ou cartão. O valor fica retido até o serviço ser concluído.',
  },
  {
    pergunta: 'O que é o check-in e check-out?',
    resposta: 'Check-in é a chegada do freela. Check-out é a confirmação de término do serviço. Ambos são obrigatórios.',
  },
  {
    pergunta: 'Quais são as taxas da plataforma?',
    resposta: 'A plataforma cobra 10% do contratante e 10% do freela, totalizando 20% por chamada.',
  },
]

export default function BotFlutuanteFAQ() {
  const [aberto, setAberto] = useState(false)
  const [respostaSelecionada, setRespostaSelecionada] = useState(null)

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Janela flutuante */}
      {aberto && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl border p-4 z-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold text-gray-800">🤖 Assistente Virtual</h2>
            <button onClick={() => setAberto(false)} className="text-gray-500 hover:text-gray-800 text-sm">✕</button>
          </div>

          {perguntasRespostas.map((item, index) => (
            <div key={index} className="mb-2">
              <button
                className="text-sm text-blue-600 font-medium hover:underline text-left"
                onClick={() => setRespostaSelecionada(index)}
              >
                {item.pergunta}
              </button>
              {respostaSelecionada === index && (
                <p className="text-xs mt-1 text-gray-700">{item.resposta}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
