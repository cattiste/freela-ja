import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function PagamentoCartaoModal({ chamada, contratante }) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [form, setForm] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  })

  function abrir() {
    setAberto(true)
    setForm({
      numero: '',
      nome: contratante?.nome || '',
      validade: '',
      cvv: ''
    })
  }

  async function gerarTokenEEnviarPagamento() {
    if (!window.EfiPay) {
      toast.error('SDK da Efí não carregada.')
      return
    }

    const [mes, ano] = form.validade.split('/')
    const options = {
      brand: 'visa',
      number: form.numero.replace(/\s/g, ''),
      cvv: form.cvv,
      expiration_month: mes,
      expiration_year: '20' + ano
    }

    setCarregando(true)
    window.EfiPay.getPaymentToken(options, async (erro, resposta) => {
      if (erro) {
        console.error('Erro ao gerar token:', erro)
        toast.error('Erro ao gerar token do cartão.')
        setCarregando(false)
        return
      }

      try {
        const resp = await axios.post('/gn/card/authorize', {
          nomeFreela: chamada.freelaNome || 'Freela',
          valorCentavos: chamada.pagamento?.valorCentavos || chamada.valorDiaria || 15000,
          descricao: 'Chamada Freela',
          payment_token: resposta.data.payment_token,
          email: contratante?.email || 'teste@teste.com',
          cpf: contratante?.cpf || '00000000191'
        })
        toast.success('✅ Pagamento realizado com sucesso!')
        setAberto(false)
      } catch (err) {
        console.error('Erro ao pagar:', err.response?.data || err.message)
        toast.error('Erro ao processar pagamento.')
      } finally {
        setCarregando(false)
      }
    })
  }

  return (
    <>
      <button onClick={abrir} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">💳 Pagar Chamada</button>

      {aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold text-center text-purple-700">💳 Pagamento com Cartão</h2>

            <input type="text" placeholder="Número do Cartão"
              className="w-full border p-2 rounded"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
            />
            <input type="text" placeholder="Nome do Titular"
              className="w-full border p-2 rounded"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <input type="text" placeholder="Validade (MM/AA)"
              className="w-full border p-2 rounded"
              value={form.validade}
              onChange={(e) => setForm({ ...form, validade: e.target.value })}
            />
            <input type="text" placeholder="CVV"
              className="w-full border p-2 rounded"
              value={form.cvv}
              onChange={(e) => setForm({ ...form, cvv: e.target.value })}
            />

            <div className="flex gap-2">
              <button
                onClick={gerarTokenEEnviarPagamento}
                disabled={carregando}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                {carregando ? '⏳ Processando...' : '💳 Confirmar Pagamento'}
              </button>
              <button onClick={() => setAberto(false)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
