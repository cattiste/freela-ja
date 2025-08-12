// src/pages/gerais/PagamentoPix.jsx
import React, { useMemo, useState } from 'react'
import { functions } from '@/firebase'
import { httpsCallable } from 'firebase/functions'
import { toast } from 'react-hot-toast'

export default function PagamentoPix() {
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [imagem, setImagem] = useState('')

  const [nome, setNome] = useState('Fulano de Tal')
  const [cpf, setCpf] = useState('12345678909') // CPF de teste
  const [valor, setValor] = useState('49.90')
  const [descricao, setDescricao] = useState('Pagamento de diária FreelaJá')

  const valorNumero = useMemo(() => {
    const v = Number(String(valor).replace(',', '.'))
    return Number.isFinite(v) && v > 0 ? v : 1
  }, [valor])

  const pagar = async () => {
    if (loading) return
    setLoading(true)
    setQrCode('')
    setImagem('')
    try {
      const gerarCobranca = httpsCallable(functions, 'gerarCobrancaPix')
      const res = await gerarCobranca({
        nome: (nome || '').trim(),
        cpf: (cpf || '').replace(/\D/g, ''),
        valor: valorNumero,
        descricao: (descricao || '').trim()
      })

      // compat com diferentes chaves que a função possa retornar
      const data = res?.data || {}
      const img =
        data.imagem ||
        data.imagemQrcode ||
        data.imagemQRCode ||
        ''
      const code =
        data.qrCode ||
        data.qrcode ||
        data.pixCopiaECola ||
        data.copiaECola ||
        ''

      if (!img && !code) {
        toast.error('Não foi possível gerar a cobrança.')
        return
      }
      setImagem(img)
      setQrCode(code)
      toast.success('Cobrança Pix gerada!')
    } catch (err) {
      console.error('[PagamentoPix] erro:', err)
      toast.error('Falha ao gerar cobrança Pix.')
    } finally {
      setLoading(false)
    }
  }

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(qrCode)
      toast.success('Código Pix copiado!')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const baixarPNG = () => {
    if (!imagem) return
    const a = document.createElement('a')
    a.href = imagem // funciona com data:image/png;base64,...
    a.download = 'qrcode-pix.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-orange-700 mb-4 text-center">Pagamento via Pix</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CPF</label>
            <input
              className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              disabled={loading}
              inputMode="numeric"
              placeholder="somente números"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$)</label>
            <input
              className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={loading}
              inputMode="decimal"
              type="number"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <input
              className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={loading}
              maxLength={140}
            />
          </div>
        </div>

        <button
          onClick={pagar}
          disabled={loading}
          className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition disabled:opacity-60"
        >
          {loading ? 'Gerando QR Code...' : 'Gerar cobrança Pix'}
        </button>

        {imagem && (
          <div className="mt-6 text-center">
            <img
              src={imagem}
              alt="QR Code Pix"
              className="mx-auto w-64 h-64 object-contain border rounded-xl"
            />
            {qrCode && (
              <>
                <p className="mt-3 text-sm text-gray-700">Pix copia e cola:</p>
                <pre className="mt-1 p-3 bg-gray-50 border rounded-xl text-xs text-gray-800 overflow-x-auto break-all whitespace-pre-wrap">
                  {qrCode}
                </pre>
                <div className="mt-3 flex gap-2 justify-center">
                  <button
                    onClick={copiarCodigo}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    Copiar código
                  </button>
                  <button
                    onClick={baixarPNG}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    Baixar PNG
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
