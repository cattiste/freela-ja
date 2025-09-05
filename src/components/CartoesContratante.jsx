// src/components/CartoesContratante.jsx
import React, { useState } from 'react'
import ListaCartoes from './ListaCartoes'
import { toast } from 'react-hot-toast'
import { getFunctions, httpsCallable } from 'firebase/functions'

const functionsClient = getFunctions(undefined, 'southamerica-east1')

export default function CartoesContratante({ uid }) {
  const [abrirCadastroCartao, setAbrirCadastroCartao] = useState(false)

  // Campos visíveis
  const [titularNome, setTitularNome] = useState('')
  const [titularCpf, setTitularCpf] = useState('')
  const [numeroCartao, setNumeroCartao] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [bandeira, setBandeira] = useState('')

  const [savingCartao, setSavingCartao] = useState(false)

  // Utils de formatação/validação (mantive as suas)
  const onlyDigits = (s = '') => String(s || '').replace(/\D/g, '')
  const luhnCheck = (num = '') => {
    const s = onlyDigits(num)
    let sum = 0, dbl = false
    for (let i = s.length - 1; i >= 0; i--) {
      let d = parseInt(s[i], 10)
      if (dbl) { d *= 2; if (d > 9) d -= 9 }
      sum += d; dbl = !dbl
    }
    return s.length >= 12 && s.length <= 19 && (sum % 10 === 0)
  }
  const isValidExpiry = (mmyy = '') => {
    const m = mmyy.slice(0, 2), y = mmyy.slice(3, 5)
    const mm = parseInt(m, 10), yy = parseInt(y, 10)
    if (!mm || !yy || mm < 1 || mm > 12) return false
    const exp = new Date(2000 + yy, mm - 1, 1)
    exp.setMonth(exp.getMonth() + 1)
    return exp > new Date()
  }
  const formatCardNumber = (v = '') => onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  const formatCPF = (v = '') => onlyDigits(v).replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
  const formatMMYY = (v = '') => {
    const d = onlyDigits(v).slice(0, 4)
    if (d.length <= 2) return d
    return d.slice(0, 2) + '/' + d.slice(2)
  }

  async function salvarNovoCartao() {
    try {
      const identLoaded = !!(window.$gn && typeof window.$gn.getPaymentToken === 'function')
      if (!identLoaded) {
        toast.error('SDK da Efí não carregou. Verifique o <script> no index.html com seu Identificador de Conta.')
        return
      }

      const numeroDigits = onlyDigits(numeroCartao)
      const cpfDigits = onlyDigits(titularCpf)
      const [mmStr, yyStr] = (validade || '').split('/')
      const mm = parseInt(mmStr, 10)
      const yy = parseInt(yyStr, 10)
      const expYear = (yyStr?.length === 2) ? (2000 + yy) : yy
      const cvvDigits = onlyDigits(cvv)
      const cvvLen = (bandeira === 'amex') ? 4 : 3

      // Validações mínimas
      if (!titularNome || !cpfDigits || !numeroDigits || !validade || !cvvDigits) {
        toast.error('Preencha todos os campos.'); return
      }
      if (cpfDigits.length !== 11) { toast.error('CPF inválido.'); return }
      if (!luhnCheck(numeroDigits)) { toast.error('Número do cartão inválido.'); return }
      if (!isValidExpiry(validade)) { toast.error('Validade inválida.'); return }
      if (cvvDigits.length !== cvvLen) { toast.error(`CVV deve ter ${cvvLen} dígitos.`); return }

      setSavingCartao(true)

      // Monta o payload para a Efí
      const cardData = {
        number: numeroDigits,
        cvv: cvvDigits,
        expiration_month: String(mm).padStart(2, '0'),
        expiration_year: String(expYear),
        holder: titularNome,
        // brand é opcional; a Efí detecta, mas se quiser usar o select:
        brand: bandeira || null,
      }

      // Tokeniza no front
      const tokenResp = await new Promise((resolve, reject) => {
        try {
          window.$gn.ready(function () {
            window.$gn.getPaymentToken(cardData, function (response) {
              if (response?.error) reject(new Error(response?.message || 'Falha ao tokenizar o cartão'))
              else resolve(response)
            })
          })
        } catch (err) {
          reject(err)
        }
      })

      const token = tokenResp?.data?.payment_token || tokenResp?.payment_token
      if (!token) throw new Error('Token de pagamento não retornado')

      // Chama sua callable para salvar o token (em vez de mandar número/cvv)
      const salvarCartaoFn = httpsCallable(functionsClient, 'salvarCartao')
      await salvarCartaoFn({
        token,
        titularNome,
        titularCpf: cpfDigits,
        brand: bandeira || null,
        last4: numeroDigits.slice(-4),
        expMonth: String(mm).padStart(2, '0'),
        expYear: String(expYear),
      })

      toast.success('Cartão cadastrado com sucesso!')
      setTitularNome(''); setTitularCpf(''); setNumeroCartao('')
      setValidade(''); setCvv(''); setBandeira('')
      setAbrirCadastroCartao(false)
    } catch (e) {
      console.error('[salvarNovoCartao]', e)
      toast.error(e?.message || 'Erro ao salvar cartão.')
    } finally {
      setSavingCartao(false)
    }
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-md p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-orange-700">💳 Meus Cartões</h2>
          <button onClick={() => setAbrirCadastroCartao(true)} className="text-sm bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700">
            ➕ Cadastrar Cartão
          </button>
        </div>

        <ListaCartoes />
      </div>

      {abrirCadastroCartao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-5 space-y-3">
            <h3 className="text-lg font-semibold text-orange-700">Cadastrar Cartão</h3>

            <input className="input" placeholder="Nome do titular" value={titularNome} onChange={(e) => setTitularNome(e.target.value)} />
            <input className="input" placeholder="CPF do titular" inputMode="numeric" value={titularCpf} onChange={(e) => setTitularCpf(formatCPF(e.target.value))} />

            <input className="input" placeholder="Número do cartão" inputMode="numeric" value={numeroCartao} onChange={(e) => setNumeroCartao(formatCardNumber(e.target.value))} />

            <select className="input" value={bandeira} onChange={(e) => setBandeira(e.target.value)}>
              <option value="">Bandeira… (opcional)</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="elo">Elo</option>
              <option value="amex">Amex</option>
              <option value="hipercard">Hipercard</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Validade (MM/AA ou MM/AAAA)" value={validade} onChange={(e) => setValidade(formatMMYY(e.target.value))} maxLength={5} />
              <input className="input" placeholder={bandeira === 'amex' ? 'CVV (4)' : 'CVV (3)'} inputMode="numeric" value={cvv} onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, bandeira === 'amex' ? 4 : 3))} />
            </div>

            <div className="flex justify-between gap-2 pt-3">
              <button onClick={() => setAbrirCadastroCartao(false)} className="flex-1 border px-4 py-2 rounded-lg">Fechar</button>
              <button onClick={salvarNovoCartao} disabled={savingCartao} className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                {savingCartao ? 'Salvando…' : 'Salvar Cartão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
