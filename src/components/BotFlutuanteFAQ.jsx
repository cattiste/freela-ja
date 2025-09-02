import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'

const perguntasRespostas = [
  {        
        pergunta: 'Como crio minha conta?',
        resposta:
          'Na página inicial, escolha "Preciso de um freela" (Contratante) ou "Sou um freela" (Freela) e siga o cadastro. Você pode completar seus dados no painel após o login.',
      },
      {        
        pergunta: 'Quais são as taxas?',
        resposta:
          'Transparência e Simplicidade Na nossa plataforma, cobramos apenas 10% de taxa de serviço sobre cada chamada realizada. Nenhuma outra taxa será aplicada, publicar vagas e se candidatar é sempre 100% gratuito. Essa contribuição é o que mantém a plataforma funcionando com qualidade, garantindo segurança, suporte e melhorias contínuas para todos os usuários.'
      },
      {        
        pergunta: 'O que é check-in e check-out?',
        resposta:
          'Check-in confirma a chegada do freela no local; check-out confirma o término. Esse fluxo garante organização e liberações corretas.',
      },
      {        
        pergunta: 'Como contrato um freela rapidamente?',
        resposta:
          'Acesse seu painel de Contratante → "Buscar Freelas" → filtre por função e proximidade → clique em "Chamar". Quando o freela aceitar, confirme a chamada e realize o pagamento (Pix ou cartão). Após o pagamento, o endereço é liberado ao freela.',
      },
      {        
        pergunta: 'Como funciona o pagamento?',
        resposta:
          'Você paga por Pix (QR Code ou copia e cola) ou cartão. Após o pagamento, liberamos o endereço ao freela e o serviço segue para check-in e check-out.',
      },
      {        
        pergunta: 'Posso adicionar observações para o freela?',
        resposta:
          'Sim. Ao chamar, inclua instruções (ex.: dress code, contato no local). O freela vê após aceitar/chamada confirmada.',
      },
      {        
        pergunta: 'Como recebo chamadas?',
        resposta:
          'Complete seu perfil no painel do Freela e mantenha-se online. Você receberá chamadas de contratantes próximos. Aceite as que fizerem sentido para você.',
      },
      {        
        pergunta: 'Quando recebo o endereço do local?',
        resposta:
          'Após o contratante confirmar e efetuar o pagamento, o endereço é liberado para você iniciar o deslocamento e realizar o check-in ao chegar.',
      },
      {        
        pergunta: 'Quando recebo pelo trabalho?',
        resposta:
          'Após o check-out confirmado, processamos o repasse conforme o método definido. A taxa de serviço do freela é de 10%.',
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
