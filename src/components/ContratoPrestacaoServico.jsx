// src/components/ContratoPrestacaoServico.jsx
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

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
          <p className="text-xs text-gray-600">
            Leia até o final. As confirmações só serão liberadas após a leitura completa.{' '}
            <Link to="/privacidade" className="underline">Política de Privacidade</Link> •{' '}
            <Link to="/termos" className="underline">Termos de Uso</Link>
          </p>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="max-h-64 overflow-y-auto p-4 text-sm leading-relaxed text-gray-800"
        >
          <h3 className="font-semibold mb-2">1. Partes e Objeto</h3>
          <p>Este contrato rege o uso da plataforma <strong>Freela Já</strong> (“Plataforma”) …</p>

          <h3 className="font-semibold mt-4 mb-2">2. Papel da Plataforma</h3>
          <p>A Plataforma atua como intermediadora tecnológica …</p>

          <h3 className="font-semibold mt-4 mb-2">3. Pagamentos e Taxas</h3>
          <p>
            Fluxo atual: cobrança pode ocorrer via PIX e futuramente cartão. Retenção de taxa de serviço
            de <strong>10% do contratante</strong> e <strong>10% do freelancer</strong> (total <strong>20%</strong>),
            com liberação ao final (check-out). Políticas podem ser atualizadas com aviso no app.
          </p>

          <h3 className="font-semibold mt-4 mb-2">4. Obrigações dos Usuários</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Fornecer dados verdadeiros e atualizados.</li>
            <li>Respeitar horários, local e escopo combinados.</li>
            <li>Não compartilhar dados sensíveis sem base legal.</li>
            <li>Manter conduta profissional e respeitosa.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">5. LGPD e Privacidade</h3>
          <p>
            Tratamento conforme <strong>Lei 13.709/2018 (LGPD)</strong>. Finalidades: criação de conta,
            verificação, execução de chamadas, pagamentos e antifraude. Compartilhamento mínimo com
            operadores essenciais. Direitos do titular respeitados, salvo retenções legais.
          </p>

          <h3 className="font-semibold mt-4 mb-2">6. Segurança e Fraude</h3>
          <p>Validação por geolocalização (ex.: raio 15 m), registro de IP, 2FA. Em suspeita, retenção/cancelamento.</p>

          <h3 className="font-semibold mt-4 mb-2">7. Cancelamentos e Estornos</h3>
          <p>Podem exigir comprovação de presença e outros critérios. Falta de pagamento no prazo pode cancelar a chamada.</p>

          <h3 className="font-semibold mt-4 mb-2">8. Responsabilidade</h3>
          <p>Sem responsabilidade por perdas indiretas/lucros cessantes; limites conforme lei.</p>

          <h3 className="font-semibold mt-4 mb-2">9. Disposições Gerais</h3>
          <p>Atualizações por publicação no app. Foro do consumidor; subsidiariamente São Paulo/SP.</p>

          <p className="mt-4 text-xs text-gray-500">Versão {versao}. Última atualização: 10/08/2025.</p>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 rounded-b-xl space-y-2">
          {!scrolledToEnd && <p className="text-xs text-orange-700">Role até o final do contrato para liberar as confirmações.</p>}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" disabled={!scrolledToEnd} checked={c1} onChange={(e) => setC1(e.target.checked)} />
            <span>Li e compreendi integralmente o Contrato (inclui LGPD).</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" disabled={!scrolledToEnd} checked={c2} onChange={(e) => setC2(e.target.checked)} />
            <span>Concordo com termos, <Link to="/privacidade" className="underline">privacidade</Link>, fluxo de pagamento e taxas.</span>
          </label>
        </div>
      </div>
    </div>
  )
}
