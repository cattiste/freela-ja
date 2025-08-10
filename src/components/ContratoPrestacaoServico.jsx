// src/components/ContratoPrestacaoServico.jsx
import React, { useEffect, useRef, useState } from 'react'

/**
 * Componente de contrato com:
 * - Leitura obrigatória (precisa rolar até o fim para habilitar checkboxes)
 * - Dupla confirmação
 * - Emite onChange(valid: boolean) para o formulário pai
 *
 * Props:
 * - versao: string (ex. "1.0.0")
 * - onChange: (valid: boolean) => void
 * - defaultChecked?: boolean (se o usuário já aceitou a mesma versão)
 */
export default function ContratoPrestacaoServico({ versao = '1.0.0', onChange, defaultChecked = false }) {
  const scrollRef = useRef(null)
  const [scrolledToEnd, setScrolledToEnd] = useState(defaultChecked)
  const [c1, setC1] = useState(defaultChecked)
  const [c2, setC2] = useState(defaultChecked)

  useEffect(() => {
    onChange?.(scrolledToEnd && c1 && c2)
  }, [scrolledToEnd, c1, c2, onChange])

  const onScroll = (e) => {
    const el = e.currentTarget
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
    if (atEnd && !scrolledToEnd) setScrolledToEnd(true)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-white">
        <div className="px-4 py-3 border-b bg-orange-50 rounded-t-xl">
          <h2 className="font-semibold text-orange-800">Contrato de Prestação de Serviços — Versão {versao}</h2>
          <p className="text-xs text-gray-600">Leia até o final. As confirmações só serão liberadas após a leitura completa.</p>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="max-h-64 overflow-y-auto p-4 text-sm leading-relaxed text-gray-800"
        >
          <h3 className="font-semibold mb-2">1. Partes e Objeto</h3>
          <p>
            Este contrato rege o uso da plataforma <strong>Freela Já</strong> (“Plataforma”) por
            estabelecimentos, pessoas físicas contratantes e freelancers (“Usuários”), com o objetivo
            de intermediar a contratação de serviços no segmento de alimentos, bebidas e eventos.
          </p>

          <h3 className="font-semibold mt-4 mb-2">2. Papel da Plataforma</h3>
          <p>
            A Plataforma atua como intermediadora tecnológica, não sendo empregadora, sócia, representante
            ou corresponsável técnica pelos serviços executados pelos freelancers. As condições comerciais
            e operacionais do serviço são acordadas entre contratante e freelancer.
          </p>

          <h3 className="font-semibold mt-4 mb-2">3. Pagamentos e Taxas</h3>
          <p>
            A contratação poderá ocorrer via PIX (QR Code/Copia e Cola) ou, futuramente, via cobrança
            em cartão. A Plataforma poderá reter valores conforme o fluxo definido: cobrança ao aceitar
            a chamada e liberação ao final (check-out), retendo taxas de serviço. O modelo atual prevê
            taxa de serviço de <strong>10% do contratante</strong> e <strong>10% do freelancer</strong>,
            podendo totalizar <strong>20%</strong> de retenção pela Plataforma, conforme comunicação vigente
            dentro do app. Valores e políticas podem ser ajustados mediante aviso prévio na Plataforma.
          </p>

          <h3 className="font-semibold mt-4 mb-2">4. Obrigações dos Usuários</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Fornecer dados verdadeiros e atualizados.</li>
            <li>Respeitar horários, local e escopo combinados na contratação.</li>
            <li>Não compartilhar dados sensíveis de terceiros sem base legal.</li>
            <li>Manter conduta profissional e respeitosa.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">5. LGPD e Privacidade</h3>
          <p>
            A Plataforma trata dados pessoais conforme a <strong>Lei 13.709/2018 (LGPD)</strong>, como
            controladora de dados necessários para: criação de conta, verificação de identidade, execução
            de chamadas, processamento de pagamentos e prevenção a fraudes. Os dados podem ser compartilhados
            com prestadores essenciais (ex.: meios de pagamento) estritamente para cumprir as finalidades
            informadas. O titular pode exercer direitos de acesso, correção e exclusão, salvo obrigações
            legais de retenção.
          </p>

          <h3 className="font-semibold mt-4 mb-2">6. Segurança e Fraude</h3>
          <p>
            Poderão ser adotadas medidas de segurança, como validação de presença por geolocalização,
            registro de IP, e confirmação em duas etapas. Em caso de suspeita de fraude, a Plataforma
            poderá reter, cancelar ou reverter transações, conforme análise de risco e leis aplicáveis.
          </p>

          <h3 className="font-semibold mt-4 mb-2">7. Cancelamentos, Estornos e Não Comparecimento</h3>
          <p>
            Políticas de cancelamento e eventual estorno podem exigir comprovação de presença (ex.: raio
            de 15 metros no check-in) ou outras evidências. O contratante tem prazo para efetuar o pagamento
            após aceite; a ausência de pagamento no prazo pode cancelar automaticamente a chamada.
          </p>

          <h3 className="font-semibold mt-4 mb-2">8. Responsabilidade</h3>
          <p>
            A Plataforma não responde por perdas indiretas, lucros cessantes ou danos decorrentes da execução
            do serviço entre as partes. Limites e exclusões de responsabilidade aplicam-se na extensão
            permitida pela legislação.
          </p>

          <h3 className="font-semibold mt-4 mb-2">9. Disposições Gerais</h3>
          <p>
            Este contrato pode ser atualizado; a versão vigente e sua data entrarão em vigor na publicação
            dentro da Plataforma. O uso contínuo implica concordância. Foro: domicílio do consumidor
            ou, se inaplicável, foro de São Paulo/SP.
          </p>

          <p className="mt-4 text-xs text-gray-500">
            Versão {versao}. Última atualização: 10/08/2025.
          </p>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 rounded-b-xl space-y-2">
          {!scrolledToEnd && (
            <p className="text-xs text-orange-700">
              Role até o final do contrato para liberar as confirmações.
            </p>
          )}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!scrolledToEnd}
              checked={c1}
              onChange={(e) => setC1(e.target.checked)}
            />
            <span>Li e compreendi integralmente o Contrato de Prestação de Serviços (LGPD incluída).</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!scrolledToEnd}
              checked={c2}
              onChange={(e) => setC2(e.target.checked)}
            />
            <span>Concordo com os termos, política de privacidade, fluxo de pagamento e taxas de serviço.</span>
          </label>
        </div>
      </div>
    </div>
  )
}
