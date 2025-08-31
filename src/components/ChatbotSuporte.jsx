// src/components/ChatbotSuporte.jsx
import React, { useMemo, useState } from 'react'

/**
 * Chatbot de suporte — versão unificada Contratante & Freela
 *
 * • Ajustado para o novo modelo: apenas "Contratante" e "Freela".
 * • Mostra CTAs "Preciso de um freela" e "Sou um freela".
 * • Explica taxas como 10% para o contratante e 10% para o freela (sem citar retenção total).
 * • Busca por palavras, categorias, e respostas colapsáveis.
 * • Suporte a callbacks de navegação via props (onNavigate).
 *
 * Props opcionais:
 *  - onNavigate?: (path: string) => void   // para integrar com seu router (ex.: navigate('/login'))
 *  - abrirSuporte?: () => void             // para abrir um chat humano/whatsapp/ticket
 */
export default function ChatbotSuporte({ onNavigate, abrirSuporte }) {
  const [papel, setPapel] = useState<'contratante' | 'freela'>('contratante')
  const [query, setQuery] = useState('')
  const [aberta, setAberta] = useState<number | null>(null)

  // CTAs principais
  const acoesPrincipais = [
    {
      id: 'cta-contratante',
      titulo: '🧑‍🍳 Preciso de um freela',
      publico: 'contratante',
      acao: () => onNavigate?.('/login?dest=contratante') || window.location.assign('/login?dest=contratante'),
      descricao: 'Entre como contratante para buscar e chamar um profissional agora.'
    },
    {
      id: 'cta-freela',
      titulo: '💼 Sou um freela',
      publico: 'freela',
      acao: () => onNavigate?.('/login?dest=freela') || window.location.assign('/login?dest=freela'),
      descricao: 'Cadastre-se como freela para receber chamadas e trabalhar quando quiser.'
    }
  ]

  // Base de conhecimento (enxuta e objetiva, por papel)
  const base = useMemo(() => {
    const comuns = [
      {
        categoria: 'Conta',
        pergunta: 'Como crio minha conta?',
        resposta:
          'Na página inicial, escolha "Preciso de um freela" (Contratante) ou "Sou um freela" (Freela) e siga o cadastro. Você pode completar seus dados no painel após o login.',
      },
      {
        categoria: 'Pagamentos',
        pergunta: 'Quais são as taxas?',
        resposta:
          'Existe uma taxa de serviço de 10% para o contratante e 10% para o freela. Isso mantém a plataforma, segurança e suporte.',
      },
      {
        categoria: 'Fluxo',
        pergunta: 'O que é check-in e check-out?',
        resposta:
          'Check-in confirma a chegada do freela no local; check-out confirma o término. Esse fluxo garante organização e liberações corretas.',
      },
    ]

    const paraContratante = [
      {
        categoria: 'Contratar',
        pergunta: 'Como contrato um freela rapidamente?',
        resposta:
          'Acesse seu painel de Contratante → "Buscar Freelas" → filtre por função e proximidade → clique em "Chamar". Quando o freela aceitar, confirme a chamada e realize o pagamento (Pix ou cartão). Após o pagamento, o endereço é liberado ao freela.',
      },
      {
        categoria: 'Pagamentos',
        pergunta: 'Como funciona o pagamento?',
        resposta:
          'Você paga por Pix (QR Code ou copia e cola) ou cartão. Após o pagamento, liberamos o endereço ao freela e o serviço segue para check-in e check-out.',
      },
      {
        categoria: 'Gerenciamento',
        pergunta: 'Posso adicionar observações para o freela?',
        resposta:
          'Sim. Ao chamar, inclua instruções (ex.: dress code, contato no local). O freela vê após aceitar/chamada confirmada.',
      },
    ]

    const paraFreela = [
      {
        categoria: 'Chamadas',
        pergunta: 'Como recebo chamadas?',
        resposta:
          'Complete seu perfil no painel do Freela e mantenha-se online. Você receberá chamadas de contratantes próximos. Aceite as que fizerem sentido para você.',
      },
      {
        categoria: 'Deslocamento',
        pergunta: 'Quando recebo o endereço do local?',
        resposta:
          'Após o contratante confirmar e efetuar o pagamento, o endereço é liberado para você iniciar o deslocamento e realizar o check-in ao chegar.',
      },
      {
        categoria: 'Recebimentos',
        pergunta: 'Quando recebo pelo trabalho?',
        resposta:
          'Após o check-out confirmado, processamos o repasse conforme o método definido. A taxa de serviço do freela é de 10%.',
      },
    ]

    return {
      contratante: [...comuns, ...paraContratante],
      freela: [...comuns, ...paraFreela],
    }
  }, [])

  const dados = base[papel]

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return dados
    return dados.filter(
      (i) =>
        i.pergunta.toLowerCase().includes(q) ||
        i.resposta.toLowerCase().includes(q) ||
        i.categoria.toLowerCase().includes(q)
    )
  }, [dados, query])

  return (
    <div className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">🤖 Assistente de Suporte</h2>

        {/* Toggle de papel */}
        <div className="inline-flex rounded-lg overflow-hidden border">
          <button
            onClick={() => setPapel('contratante')}
            className={`px-3 py-2 text-sm font-medium ${papel === 'contratante' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Contratante
          </button>
          <button
            onClick={() => setPapel('freela')}
            className={`px-3 py-2 text-sm font-medium ${papel === 'freela' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Freela
          </button>
        </div>
      </header>

      {/* CTAs principais */}
      <div className="grid sm:grid-cols-2 gap-3">
        {acoesPrincipais.map((a) => (
          <div key={a.id} className="border rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">{a.descricao}</div>
            <button
              onClick={a.acao}
              className="w-full bg-orange-600 text-white rounded-lg px-3 py-2 hover:bg-orange-700"
            >
              {a.titulo}
            </button>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar ajuda (ex.: pagamento, check-in, taxas)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 pr-9 outline-none focus:ring-2 focus:ring-orange-400"
        />
        <span className="absolute right-3 top-2.5 text-gray-400">🔎</span>
      </div>

      {/* FAQ filtrável */}
      <div className="divide-y">
        {filtrados.map((item, idx) => (
          <div key={`${item.pergunta}-${idx}`} className="py-3">
            <button
              onClick={() => setAberta((n) => (n === idx ? null : idx))}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">{item.categoria}</div>
                  <div className="font-medium text-gray-900">{item.pergunta}</div>
                </div>
                <span className="text-gray-400">{aberta === idx ? '▾' : '▸'}</span>
              </div>
            </button>

            {aberta === idx && (
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                {item.resposta}
              </p>
            )}
          </div>
        ))}

        {filtrados.length === 0 && (
          <p className="py-6 text-center text-gray-500 text-sm">
            Nenhum resultado para “{query}”. Tente outras palavras.
          </p>
        )}
      </div>

      {/* Ajuda humana */}
      <div className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Precisa falar com alguém do time? Estamos por aqui.
        </div>
        <button
          onClick={() => abrirSuporte?.() || window.open('mailto:contato@freelaja.com.br', '_blank')}
          className="bg-white border rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          Falar com o suporte
        </button>
      </div>
    </div>
  )
}
