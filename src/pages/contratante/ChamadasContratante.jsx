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
  const [bandeira, setBandeira] = useState('')
  const [senhaPagamento, setSenhaPagamento] = useState('')
  const [savingCartao, setSavingCartao] = useState(false)

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
        const fn = httpsCallable(getFunctions(), 'pagarFreelaAoCheckout')
        await fn({
          chamadaId: ch.id,
          valorReceber: Number((ch.valorDiaria * 0.90).toFixed(2))
        })
      }
    } catch (e) {
      console.error(e); toast.error('Erro ao confirmar check-out.')
    }
  }

  // 💳 pagamento com cartão
  async function pagarComCartao(ch) {
    try {
      if (!ch.valorDiaria) { toast.error('Valor inválido.'); return }
      const senha = window.prompt('Digite sua senha de pagamento:')
      if (!senha) return

      const fn = getFunctions()

      await httpsCallable(fn, 'confirmarPagamentoComSenha')({ uid: estab.uid, senha })
      const pagar = await httpsCallable(fn, 'pagarFreela')({ chamadaId: ch.id })
      if (!pagar?.data?.sucesso) { toast.error('Falha no pagamento'); return }

      await httpsCallable(fn, 'registrarPagamentoEspelho')({
        chamadaId: ch.id,
        valor: Number((ch.valorDiaria * 1.10).toFixed(2)),
        metodo: 'cartao'
      })

      await updateDoc(doc(db, 'chamadas', ch.id), {
        metodoPagamento: 'cartao',
        liberarEnderecoAoFreela: true
      })

      toast.success('💳 Pagamento confirmado!')
    } catch (e) {
      console.error(e); toast.error(e.message)
    }
  }

  // 💸 Pix callable
  async function gerarPix(ch) {
    try {
      if (!ch.valorDiaria) { toast.error('Valor inválido.'); return }
      const valorCobrar = Number((ch.valorDiaria * 1.10).toFixed(2))
      const cpf = estab?.cpf || estab?.documento
      if (!cpf) { toast.error('CPF do pagador não encontrado.'); return }

      const fn = httpsCallable(getFunctions(), 'gerarPixCallable')
      const res = await fn({
        valor: valorCobrar,
        nome: estab?.nome || estab?.nomeResponsavel || 'Contratante',
        cpf,
        idChamada: ch.id
      })
      if (!res?.data?.sucesso) { toast.error('Erro ao gerar Pix'); return }

      const { imagemQrCode, qrCode } = res.data
      await updateDoc(doc(db, 'chamadas', ch.id), {
        qrCodePix: imagemQrCode || null,
        copiaColaPix: qrCode || null,
        pagamentoStatus: 'aguardando_pix',
        metodoPagamento: 'pix'
      })

      await httpsCallable(getFunctions(), 'registrarPagamentoEspelho')({
        chamadaId: ch.id,
        valor: valorCobrar,
        metodo: 'pix'
      })

      toast.success('💸 Pix gerado!')
    } catch (e) {
      console.error(e); toast.error(e.message)
    }
  }

  // cadastrar novo cartão
  async function salvarNovoCartao() {
    try {
      if (!numeroCartao || !bandeira || !senhaPagamento) {
        toast.error('Preencha todos os campos.'); return
      }
      setSavingCartao(true)
      const salvarFn = httpsCallable(getFunctions(), 'salvarCartao')
      await salvarFn({ numeroCartao, bandeira, senhaPagamento })
      toast.success('Cartão cadastrado!')
      setAbrirCadastroCartao(false)
      setNumeroCartao(''); setBandeira(''); setSenhaPagamento('')
    } catch (e) {
      console.error(e); toast.error(e.message)
    } finally { setSavingCartao(false) }
  }

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      {/* pagamentos */}
      <div className="bg-white shadow border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-orange-700">💳 Pagamentos</h2>
          <button onClick={() => setAbrirCadastroCartao(true)}
            className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700">
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
          <h2 className="font-semibold text-orange-600">Chamada #{ch.id.slice(-5)}</h2>
          <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
          <p><strong>Status:</strong> {ch.status}</p>
          {typeof ch.valorDiaria === 'number' &&
            <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>}
          {ch.observacao && <p>📝 {ch.observacao}</p>}

          <MensagensRecebidasContratante chamadaId={ch.id} />
          {ch.status === 'concluido' && !ch.avaliadoPeloContratante &&
            <AvaliacaoContratante chamada={ch} />}

          {ch.status === 'aceita' && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => pagarComCartao(ch)}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg">
                  💳 Pagar Cartão
                </button>
                <button onClick={() => gerarPix(ch)}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg">
                  💸 Gerar Pix
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => confirmarChamada(ch)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg">
                  ✅ Confirmar
                </button>
                <button onClick={() => cancelarChamada(ch)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
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
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">
              📍 Confirmar Check-in
            </button>
          )}
          {ch.status === 'checkout_freela' && (
            <button onClick={() => confirmarCheckOutFreela(ch)}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg">
              ⏳ Confirmar Check-out
            </button>
          )}
          {(ch.status === 'concluido' || ch.status === 'finalizada') &&
            <span className="text-green-600 font-bold block text-center">✅ Finalizada</span>}
        </div>
      ))}

      {/* modal cadastrar cartão */}
      {abrirCadastroCartao && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 space-y-3">
            <div className="flex justify-between">
              <h3 className="font-semibold text-orange-700">Cadastrar Cartão</h3>
              <button onClick={() => setAbrirCadastroCartao(false)}>✕</button>
            </div>
            <input className="border w-full p-2 rounded"
              placeholder="Número do cartão" value={numeroCartao}
              onChange={e => setNumeroCartao(e.target.value)} />
            <select className="border w-full p-2 rounded"
              value={bandeira} onChange={e => setBandeira(e.target.value)}>
              <option value="">Bandeira</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="elo">Elo</option>
              <option value="amex">Amex</option>
              <option value="hipercard">Hipercard</option>
            </select>
            <input type="password" className="border w-full p-2 rounded"
              placeholder="Senha de pagamento" value={senhaPagamento}
              onChange={e => setSenhaPagamento(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setAbrirCadastroCartao(false)}
                className="flex-1 border rounded px-3 py-2">Cancelar</button>
              <button onClick={salvarNovoCartao} disabled={savingCartao}
                className="flex-1 bg-orange-600 text-white rounded px-3 py-2">
                {savingCartao ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
