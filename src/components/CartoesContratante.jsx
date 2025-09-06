import React, { useState } from 'react'
import ListaCartoes from './ListaCartoes'
import { toast } from 'react-hot-toast'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getPaymentTokenEfipay } from '@/utils/efipay'
import { loadEfipayScript } from '@/utils/loadEfipayScript'

const functionsClient = getFunctions(undefined, 'southamerica-east1')

export default function CartoesContratante() {
  const [abrirCadastroCartao, setAbrirCadastroCartao] = useState(false)

  // form
  const [titularNome, setTitularNome] = useState('')
  const [titularCpf, setTitularCpf] = useState('')
  const [numeroCartao, setNumeroCartao] = useState('')
  const [validade, setValidade] = useState('') // MM/AA ou MM/AAAA
  const [cvv, setCvv] = useState('')
  const [bandeira, setBandeira] = useState('') // opcional
  const [senhaPagamento, setSenhaPagamento] = useState('') // 4–6 dígitos

  const [savingCartao, setSavingCartao] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // helpers
  const onlyDigits = (s = '') => String(s || '').replace(/\D/g, '')
  const formatCardNumber = (v = '') =>
    onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  const formatCPF = (v = '') =>
    onlyDigits(v).replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
  const formatMMYY = (v = '') => {
    const d = onlyDigits(v).slice(0, 4)
    if (d.length <= 2) return d
    return d.slice(0, 2) + '/' + d.slice(2)
  }
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
    const [m, y] = (mmyy || '').split('/')
    const mm = parseInt(m, 10), yy = parseInt(y, 10)
    if (!mm || !yy || mm < 1 || mm > 12) return false
    const fullYear = y.length === 2 ? 2000 + yy : yy
    const exp = new Date(fullYear, mm - 1, 1); exp.setMonth(exp.getMonth() + 1)
    return exp > new Date()
  }

useEffect(() => {
  loadEfipayScript('SEU_ID_DA_CREDENCIAL_EFI')
    .then(() => console.log('SDK Efipay carregado com sucesso.'))
    .catch((e) => console.error('Erro ao carregar SDK:', e))
}, [])

  async function salvarNovoCartao() {
    try {
      const numeroDigits = onlyDigits(numeroCartao)
      const cpfDigits = onlyDigits(titularCpf)
      const [mmStr = '', yyStr = ''] = (validade || '').split('/')
      const expYear = yyStr.length === 2 ? '20' + yyStr : yyStr
      const cvvDigits = onlyDigits(cvv)

      if (!titularNome || cpfDigits.length !== 11) return toast.error('Informe nome e CPF válidos.')
      if (!luhnCheck(numeroDigits)) return toast.error('Número do cartão inválido.')
      if (!isValidExpiry(validade)) return toast.error('Validade inválida.')
      const cvvLen = bandeira === 'amex' ? 4 : 3
      if (cvvDigits.length !== cvvLen) return toast.error(`CVV deve ter ${cvvLen} dígitos.`)

      const senhaDigits = onlyDigits(senhaPagamento)
      if (senhaDigits.length < 4 || senhaDigits.length > 6) {
        return toast.error('Senha de pagamento deve ter 4 a 6 dígitos.')
      }

      setSavingCartao(true)

      // tokeniza via Efí (com helper que resolve o $gn.ready)
      const token = await getPaymentTokenEfipay({
        number: numeroDigits,
        cvv: cvvDigits,
        expiration_month: mmStr.padStart(2, '0'),
        expiration_year: expYear,
        holder: titularNome,
        brand: bandeira || null,
      })

      // salva APENAS token + dados do titular; senha é hasheada no backend
      const salvarCartaoFn = httpsCallable(functionsClient, 'salvarCartao')
      await salvarCartaoFn({
        token,
        titularNome,
        titularCpf: cpfDigits,
        last4: numeroDigits.slice(-4),
        brand: bandeira || null,
        expMonth: mmStr.padStart(2, '0'),
        expYear: expYear,
        senhaPagamento: senhaDigits,
      })

      toast.success('Cartão cadastrado com sucesso!')
      setTitularNome(''); setTitularCpf(''); setNumeroCartao('')
      setValidade(''); setCvv(''); setBandeira(''); setSenhaPagamento('')
      setAbrirCadastroCartao(false)
    } catch (e) {
      console.error('[salvarNovoCartao]', e)
      toast.error(e?.message || 'Erro ao salvar cartão.')
    } finally {
      setSavingCartao(false)
    }
  }

  async function excluirCartao() {
    try {
      setDeleting(true)
      const fn = httpsCallable(functionsClient, 'excluirCartao')
      await fn()
      toast.success('Cartão excluído.')
    } catch (e) {
      console.error('[excluirCartao]', e)
      toast.error(e?.message || 'Não foi possível excluir o cartão.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-md p-4 space-y-6">
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-xl font-bold text-orange-700">💳 Meus Cartões</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAbrirCadastroCartao(true)}
              className="text-sm bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700"
            >
              ➕ Cadastrar Cartão
            </button>
            <button
              onClick={excluirCartao}
              disabled={deleting}
              className="text-sm border px-3 py-2 rounded-lg hover:bg-gray-100"
              title="Excluir cartão salvo"
            >
              {deleting ? 'Excluindo…' : '🗑️ Excluir cartão'}
            </button>
          </div>
        </div>

        {/* Lista atual (cartão tokenizado) */}
        <ListaCartoes />
      </div>

      {abrirCadastroCartao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-5 space-y-3">
            <h3 className="text-lg font-semibold text-orange-700">Cadastrar Cartão</h3>

            <input
              className="input"
              placeholder="Nome do titular"
              value={titularNome}
              onChange={(e) => setTitularNome(e.target.value)}
            />

            <input
              className="input"
              placeholder="CPF do titular"
              inputMode="numeric"
              value={titularCpf}
              onChange={(e) => setTitularCpf(formatCPF(e.target.value))}
            />

            <input
              className="input"
              placeholder="Número do cartão"
              inputMode="numeric"
              value={numeroCartao}
              onChange={(e) => setNumeroCartao(formatCardNumber(e.target.value))}
            />

            <select
              className="input"
              value={bandeira}
              onChange={(e) => setBandeira(e.target.value)}
            >
              <option value="">Bandeira… (opcional)</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="elo">Elo</option>
              <option value="amex">Amex</option>
              <option value="hipercard">Hipercard</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="Validade (MM/AA ou MM/AAAA)"
                value={validade}
                onChange={(e) => setValidade(formatMMYY(e.target.value))}
                maxLength={5}
              />
              <input
                className="input"
                placeholder={bandeira === 'amex' ? 'CVV (4)' : 'CVV (3)'}
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, bandeira === 'amex' ? 4 : 3))}
              />
            </div>

            {/* Senha de pagamento */}
            <input
              className="input"
              type="password"
              inputMode="numeric"
              placeholder="Senha de pagamento (4–6 dígitos)"
              value={senhaPagamento}
              onChange={(e) => setSenhaPagamento(onlyDigits(e.target.value).slice(0, 6))}
            />

            <div className="flex justify-between gap-2 pt-3">
              <button
                onClick={() => setAbrirCadastroCartao(false)}
                className="flex-1 border px-4 py-2 rounded-lg"
              >
                Fechar
              </button>
              <button
                onClick={salvarNovoCartao}
                disabled={savingCartao}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                {savingCartao ? 'Salvando…' : 'Salvar Cartão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
