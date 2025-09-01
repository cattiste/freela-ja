// src/components/ChatbotSuporte.jsx
import React, { useState } from 'react'

const perguntasRespostas = [
  {        
        pergunta: 'Como crio minha conta?',
        resposta:
          'Na página inicial, escolha "Preciso de um freela" (Contratante) ou "Sou um freela" (Freela) e siga o cadastro. Você pode completar seus dados no painel após o login.',
      },
      {        
        pergunta: 'Quais são as taxas?',
        resposta:
          'Existe uma taxa de serviço de 10% para o contratante e 10% para o freela. Isso mantém a plataforma, segurança e suporte.',
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
