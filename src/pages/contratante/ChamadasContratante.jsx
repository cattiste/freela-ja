import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'
import MensagensRecebidasContratante from '@/components/MensagensRecebidasContratante'
import ListaCartoes from '@/components/ListaCartoes'
import SalvarSenhaCartao from '@/components/SalvarSenhaCartao'
import { getFunctions, httpsCallable } from 'firebase/functions'
const functionsClient = getFunctions(undefined, 'southamerica-east1')

const STATUS_LISTA = [
  'pendente', 'aceita', 'confirmada', 'checkin_freela',
  'em_andamento', 'checkout_freela', 'concluido',
  'finalizada', 'cancelada_por_falta_de_pagamento', 'rejeitada', 'pago'
]

export default function ChamadasContratante({ contratante }) {
  const { usuario } = useAuth()
  const estab = contratante || usuario
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)

  // modal cartão
  const [abrirCadastroCartao, setAbrirCadastroCartao] = useState(false)
  const [numeroCartao, setNumeroCartao] = useState('')
  const [titularNome, setTitularNome] = useState('')
  const [titularCpf, setTitularCpf] = useState('')
  const [validade, setValidade] = useState('')   // "MM/YY"
  const [cvv, setCvv] = useState('')
  const [bandeira, setBandeira] = useState('')
  const [senhaPagamento, setSenhaPagamento] = useState('')
  const [savingCartao, setSavingCartao] = useState(false)

  // --- helpers (uma única vez) ---
  const onlyDigits = (s = '') => String(s || '').replace(/\D/g, '')
  const isCpf = (d) => d && d.length === 11
  const isCnpj = (d) => d && d.length === 14

  function formatCardNumber(v = '') {
    const d = onlyDigits(v).slice(0, 19)
    return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }
  function formatMMYY(v = '') {
    const d = onlyDigits(v).slice(0, 4)
    if (d.length <= 2) return d
    return d.slice(0, 2) + '/' + d.slice(2)
  }
  function formatCPF(v = '') {
    const d = onlyDigits(v).slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return d.replace(/(\d{3})(\d+)/, '$1.$2')
    if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3')
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
  }
  function isValidExpiry(mmyy = '') {
    const m = mmyy.slice(0, 2), y = mmyy.slice(3, 5)
    const mm = parseInt(m, 10), yy = parseInt(y, 10)
    if (!mm || !yy || mm < 1 || mm > 12) return false
    const year = 2000 + yy
    const now = new Date()
    const exp = new Date(year, mm - 1, 1)
    exp.setMonth(exp.getMonth() + 1) // 1º do mês seguinte
    return exp > now
  }
  function luhnCheck(num = '') {
    const s = onlyDigits(num)
    let sum = 0, dbl = false
    for (let i = s.length - 1; i >= 0; i--) {
      let d = parseInt(s[i], 10)
      if (dbl) { d *= 2; if (d > 9) d -= 9 }
      sum += d; dbl = !dbl
    }
    return s.length >= 12 && s.length <= 19 && (sum % 10 === 0)
  }

  useEffect(() => {
    if (!estab?.uid) return
    setLoading(true)
    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', estab.uid),
      where('status', 'in', STATUS_LISTA)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const filtradas = docs.filter((ch) =>
        ch.status !== 'rejeitada' &&
        !(ch.status === 'concluido' && ch.avaliadoPeloContratante) &&
        ch.status !== 'finalizada'
      )
      setChamadas(filtradas)
      setLoading(false)
    }, (err) => {
      console.error('[ChamadasContratante] onSnapshot erro:', err)
      toast.error('Falha ao carregar chamadas.')
      setLoading(false)
    })
    return () => unsub()
  }, [estab?.uid])

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0)
    return [...chamadas].sort((a, b) => ts(b.criadoEm) - ts(a.criadoEm))
  }, [chamadas])

  // ---- ações ----
  async function confirmarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'confirmada',
        confirmadaEm: serverTimestamp()
      })
      toast.success('✅ Chamada confirmada!')
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar chamada.')
    }
  }

  async function cancelarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'cancelada_por_falta_de_pagamento',
        canceladaEm: serverTimestamp()
      })
      toast.success('❌ Chamada cancelada.')
    } catch (e) {
      console.error(e); toast.error('Erro ao cancelar chamada.')
    }
  }

  async function confirmarCheckInFreela(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'em_andamento',
        checkInConfirmadoPeloEstab: true,
        checkInConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('📍 Check-in do freela confirmado!')
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOutFreela(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'concluido',
        checkOutConfirmadoPeloEstab: true,
        checkOutConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('⏳ Check-out confirmado!')

      if (typeof ch.valorDiaria === 'number' && ch.valorDiaria > 0) {
        const fn = httpsCallable(functionsClient, 'pagarFreelaAoCheckout')
        await fn({
          chamadaId: ch.id,
          valorReceber: Number((ch.valorDiaria * 0.90).toFixed(2))
        })
      }
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar check-out.')
    }
  }

  // 💳 pagamento com cartão (senha → confirmarPagamentoComSenha → pagarFreela → registrarPagamentoEspelho)
  async function pagarComCartao(ch) {
    try {
      if (!ch.valorDiaria) { toast.error('Valor inválido.'); return }
      const senha = window.prompt('Digite sua senha de pagamento:')
      if (!senha) return

      const fn = getFunctions()

      await httpsCallable(functionsClient, 'confirmarPagamentoComSenha')({ uid: estab.uid, senha })
      const pagar = await httpsCallable(functionsClient, 'pagarFreela')({ chamadaId: ch.id })
      if (!pagar?.data?.sucesso) { toast.error('Falha no pagamento'); return }

      await httpsCallable(functionsClient, 'registrarPagamentoEspelho')({
        chamadaId: ch.id,
        valor: Number((ch.valorDiaria * 1.10).toFixed(2)), // diária + 10% (lado contratante)
        metodo: 'cartao'
      })

      await updateDoc(doc(db, 'chamadas', ch.id), {
        metodoPagamento: 'cartao',
        liberarEnderecoAoFreela: true // libera endereço imediatamente no cartão
      })

      toast.success('💳 Pagamento confirmado!')
    } catch (e) {
      console.error(e); toast.error(e.message || 'Erro ao processar pagamento.')
    }
  }

  // 💸 Pix (callable) — aceita CPF **ou** CNPJ do pagador
  async function gerarPix(ch) {
    try {
      if (!ch?.valorDiaria) { toast.error('Valor inválido.'); return }
      const valorCobrar = Number((ch.valorDiaria * 1.10).toFixed(2)) // diária + 10% do contratante

      // tenta pegar do cadastro
      let docPagador = onlyDigits(estab?.cpf || estab?.cnpj || estab?.documento)
      if (!isCpf(docPagador) && !isCnpj(docPagador)) {
        const entrada = window.prompt('Informe o CPF (11 dígitos) ou CNPJ (14 dígitos) do pagador:')
        docPagador = onlyDigits(entrada || '')
      }
      if (!isCpf(docPagador) && !isCnpj(docPagador)) {
        toast.error('CPF/CNPJ do pagador inválido.'); return
      }

      const nomePagador = estab?.nome || estab?.nomeResponsavel || 'Contratante'

      const fn = httpsCallable(functionsClient, 'gerarPixCallable')
      const res = await fn({
        valor: valorCobrar,
        nome: nomePagador,
        cpfCnpj: docPagador,
        idChamada: ch.id
      })
      if (!res?.data?.sucesso) { toast.error('Erro ao gerar Pix.'); return }

      const { imagemQrCode, qrCode } = res.data
      await updateDoc(doc(db, 'chamadas', ch.id), {
        qrCodePix: imagemQrCode || null,
        copiaColaPix: qrCode || null,
        pagamentoStatus: 'aguardando_pix',
        metodoPagamento: 'pix'
      })

      await httpsCallable(functionsClient, 'registrarPagamentoEspelho')({
        chamadaId: ch.id,
        valor: valorCobrar,
        metodo: 'pix'
      })

      toast.success('💸 Pix gerado! Aguarde a confirmação do pagamento.')
    } catch (e) {
      console.error('[gerarPix] erro:', e)
      toast.error(e?.message || 'Erro ao gerar Pix.')
    }
  }

  // cadastrar novo cartão
  async function salvarNovoCartao() {
    try {
      const numeroDigits = onlyDigits(numeroCartao)
      const cpfDigits = onlyDigits(titularCpf)
      const [mmStr, yyStr] = (validade || '').split('/')
      const mm = parseInt(mmStr, 10)
      const yy = parseInt(yyStr, 10)
      const cvvDigits = onlyDigits(cvv)
      const cvvLen = (bandeira === 'amex') ? 4 : 3

      // validações
      if (!numeroDigits || !bandeira || !titularNome || !cpfDigits || !validade || !cvvDigits || !senhaPagamento) {
        toast.error('Preencha todos os campos.'); return
      }
      if (!luhnCheck(numeroDigits)) { toast.error('Número do cartão inválido.'); return }
      if (!isValidExpiry(validade)) { toast.error('Validade inválida (MM/YY).'); return }
      if (cvvDigits.length !== cvvLen) { toast.error(`CVV deve ter ${cvvLen} dígitos.`); return }
      if (cpfDigits.length !== 11) { toast.error('CPF do titular inválido.'); return }

      setSavingCartao(true)
      const salvarCartaoFn = httpsCallable(functionsClient, 'salvarCartao')
      await salvarCartaoFn({
        numeroCartao: numeroDigits,    // ideal: tokenizar no back
        bandeira,
        titularNome,
        titularCpf: cpfDigits,
        validadeMes: mm,
        validadeAno: 2000 + yy,
        cvv: cvvDigits,                // usar apenas para tokenizar; NÃO persistir
        senhaPagamento                 // senha de pagamento (hash no back)
      })

      toast.success('Cartão cadastrado com sucesso!')
      setNumeroCartao(''); setBandeira(''); setTitularNome(''); setTitularCpf('')
      setValidade(''); setCvv(''); setSenhaPagamento('')
      setAbrirCadastroCartao(false)
    } catch (e) {
      console.error('[salvarNovoCartao]', e)
      toast.error(e?.message || 'Erro ao salvar cartão.')
    } finally {
      setSavingCartao(false)
    }
  }

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      {/* pagamentos */}
      <div className="bg-white shadow border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-orange-700">💳 Pagamentos</h2>
          <button
            onClick={() => setAbrirCadastroCartao(true)}
            className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700"
          >
            ➕ Cadastrar Cartão
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ListaCartoes />
          <SalvarSenhaCartao uid={estab?.uid} />
        </div>
      </div>

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa.</p>
      ) : chamadasOrdenadas.map((ch) => (
        <div key={ch.id} className="bg-white shadow p-4 rounded-xl mb-4 border space-y-2">
          <h2 className="font-semibold text-orange-600">Chamada #{String(ch.id).slice(-5)}</h2>
          <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
          <p><strong>Status:</strong> {ch.status}</p>
          {typeof ch.valorDiaria === 'number' && (
            <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>
          )}
          {ch.observacao && <p>📝 {ch.observacao}</p>}

          <MensagensRecebidasContratante chamadaId={ch.id} />

          {ch.status === 'concluido' && !ch.avaliadoPeloContratante && (
            <AvaliacaoContratante chamada={ch} />
          )}

          {ch.status === 'aceita' && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => pagarComCartao(ch)}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  💳 Pagar Cartão
                </button>
                <button onClick={() => gerarPix(ch)}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                  💸 Gerar Pix
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => confirmarChamada(ch)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  ✅ Confirmar
                </button>
                <button onClick={() => cancelarChamada(ch)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}

          {(ch.qrCodePix || ch.copiaColaPix) && (
            <div className="bg-gray-50 border rounded-lg p-2 text-center">
              <p className="font-semibold text-green-600">✅ Pix gerado</p>
              {ch.qrCodePix && <img src={ch.qrCodePix} alt="QR Code Pix" className="mx-auto w-40" />}
              {ch.copiaColaPix && <p className="text-xs break-all">{ch.copiaColaPix}</p>}
            </div>
          )}

          {ch.status === 'checkin_freela' && (
            <button onClick={() => confirmarCheckInFreela(ch)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              📍 Confirmar Check-in
            </button>
          )}
          {ch.status === 'checkout_freela' && (
            <button onClick={() => confirmarCheckOutFreela(ch)}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
              ⏳ Confirmar Check-out
            </button>
          )}
          {(ch.status === 'concluido' || ch.status === 'finalizada') && (
            <span className="text-green-600 font-bold block text-center">✅ Finalizada</span>
          )}
        </div>
      ))}

      {/* Modal de cadastro de cartão */}
      {abrirCadastroCartao && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-700">Cadastrar Cartão</h3>
              <button
                onClick={() => setAbrirCadastroCartao(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fechar"
              >✕</button>
            </div>

            {/* Nome do titular */}
            <div className="space-y-1">
              <label className="block text-sm font-medium">Nome do titular</label>
              <input
                type="text"
                placeholder="Como aparece no cartão"
                value={titularNome}
                onChange={(e) => setTitularNome(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* CPF do titular */}
            <div className="space-y-1">
              <label className="block text-sm font-medium">CPF do titular</label>
              <input
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={titularCpf}
                onChange={(e) => setTitularCpf(formatCPF(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Número do cartão */}
            <div className="space-y-1">
              <label className="block text-sm font-medium">Número do cartão</label>
              <input
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={numeroCartao}
                onChange={(e) => setNumeroCartao(formatCardNumber(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Bandeira */}
            <div className="space-y-1">
              <label className="block text-sm font-medium">Bandeira</label>
              <select
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                value={bandeira}
                onChange={(e) => setBandeira(e.target.value)}
              >
                <option value="">Selecione…</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="elo">Elo</option>
                <option value="amex">Amex</option>
                <option value="hipercard">Hipercard</option>
              </select>
            </div>

            {/* Validade + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium">Validade (MM/YY)</label>
                <input
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={validade}
                  onChange={(e) => setValidade(formatMMYY(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                  maxLength={5}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium">CVV</label>
                <input
                  inputMode="numeric"
                  placeholder={bandeira === 'amex' ? '0004' : '000'}
                  value={cvv}
                  onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, bandeira === 'amex' ? 4 : 3))}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                  maxLength={bandeira === 'amex' ? 4 : 3}
                />
              </div>
            </div>

            {/* Senha de pagamento */}
            <div className="space-y-1">
              <label className="block text-sm font-medium">Senha de pagamento</label>
              <input
                type="password"
                placeholder="Defina uma senha"
                value={senhaPagamento}
                onChange={(e) => setSenhaPagamento(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAbrirCadastroCartao(false)}
                className="flex-1 border px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarNovoCartao}
                disabled={savingCartao}
                className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-60"
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
