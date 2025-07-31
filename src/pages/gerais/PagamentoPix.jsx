import { functions } from '@/firebase'
import { httpsCallable } from 'firebase/functions'
import { useState } from 'react'

export default function PagamentoPix() {
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [imagem, setImagem] = useState(null)

  const pagar = async () => {
    setLoading(true)

    const gerarCobranca = httpsCallable(functions, 'gerarCobrancaPix')
    const res = await gerarCobranca({
      nome: 'Fulano de Tal',
      cpf: '12345678909', // CPF de teste
      valor: 49.90,
      descricao: 'Pagamento de diária FreelaJá'
    })

    setQrCode(res.data.qrCode)
    setImagem(res.data.imagem)
    setLoading(false)
  }

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold text-orange-700 mb-4">Pagamento via Pix</h2>
      <button
        onClick={pagar}
        disabled={loading}
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
      >
        {loading ? 'Gerando QR Code...' : 'Gerar cobrança Pix'}
      </button>

      {imagem && (
        <div className="mt-6">
          <img src={imagem} alt="QR Code Pix" className="mx-auto w-64 h-64" />
          <p className="mt-2 text-sm text-gray-600 break-all">{qrCode}</p>
        </div>
      )}
    </div>
  )
}
