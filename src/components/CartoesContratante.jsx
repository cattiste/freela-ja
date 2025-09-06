import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { db } from '../firebase'
import { toast } from 'react-toastify'
import { getPaymentTokenEfipay } from '../utils/efipay'

export default function CartoesContratante() {
  const { usuario } = useAuth()
  const [abrirCadastroCartao, setAbrirCadastroCartao] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    numero: '',
    expiracao: '',
    cvv: '',
    bandeira: ''
  })
  const [salvando, setSalvando] = useState(false)

  const salvarCartao = async () => {
    if (!usuario?.uid) return

    const [mes, ano] = form.expiracao.split('/')
    const cardData = {
      brand: form.bandeira,
      holder: form.nome,
      number: form.numero,
      expiration_month: mes,
      expiration_year: ano,
      cvv: form.cvv
    }

    setSalvando(true)
    try {
      const payment_token = await getPaymentTokenEfipay(cardData)
      if (!payment_token) throw new Error('Token de pagamento não gerado.')

      await setDoc(doc(db, 'cartoes', usuario.uid), {
        numeroFinal: form.numero.slice(-4),
        bandeira: form.bandeira,
        payment_token,
        uid: usuario.uid
      })

      toast.success('✅ Cartão salvo com sucesso!')
      setAbrirCadastroCartao(false)
    } catch (e) {
      console.error('[salvarCartao] erro:', e)
      toast.error(e.message || 'Erro ao salvar cartão.')
    } finally {
      setSalvando(false)
    }
  }

  const atualizarCampo = (campo, valor) =>
    setForm((f) => ({ ...f, [campo]: valor }))

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-orange-700 mb-4">💳 Meus Cartões</h2>

      <button
        onClick={() => setAbrirCadastroCartao(true)}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded shadow"
      >
        + Cadastrar Cartão
      </button>

      {abrirCadastroCartao && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-700">
                Cadastrar Cartão
              </h3>
              <button
                onClick={() => setAbrirCadastroCartao(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Nome impresso"
              value={form.nome}
              onChange={(e) => atualizarCampo('nome', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <input
              type="text"
              placeholder="Número do cartão"
              value={form.numero}
              onChange={(e) => atualizarCampo('numero', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="MM/AA"
                value={form.expiracao}
                onChange={(e) => atualizarCampo('expiracao', e.target.value)}
                className="w-1/2 border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="CVV"
                value={form.cvv}
                onChange={(e) => atualizarCampo('cvv', e.target.value)}
                className="w-1/2 border rounded px-3 py-2"
              />
            </div>

            <input
              type="text"
              placeholder="Bandeira (ex: visa, mastercard)"
              value={form.bandeira}
              onChange={(e) => atualizarCampo('bandeira', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setAbrirCadastroCartao(false)}
                className="px-4 py-2 border rounded"
              >
                Fechar
              </button>
              <button
                onClick={salvarCartao}
                disabled={salvando}
                className={`px-4 py-2 rounded text-white ${
                  salvando ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {salvando ? 'Salvando...' : 'Salvar Cartão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
