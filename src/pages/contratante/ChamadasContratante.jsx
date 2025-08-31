import React, { useEffect, useMemo, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'
import MensagensRecebidasContratante from '@/components/MensagensRecebidasContratante'

// 🔐 Gestão de cartões (fora dos cards p/ não mexer no layout dos cards)
import SalvarSenhaCartao from '@/components/SalvarSenhaCartao'
import ListaCartoes from '@/components/ListaCartoes'

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

      // mantém teu filtro original
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

  // ------------------------
  // Fluxos originais mantidos
  async function confirmarChamada(ch) {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'confirmada',
        confirmadaEm: serverTimestamp()
      })
      toast.success('✅ Chamada confirmada!')
    } catch (e) {
      console.error('[ChamadasContratante] confirmarChamada erro:', e)
      toast.error('Erro ao confirmar chamada.')
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
      console.error('[ChamadasContratante] cancelarChamada erro:', e)
      toast.error('Erro ao cancelar chamada.')
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
      console.error('[ChamadasContratante] confirmarCheckInFreela erro:', e)
      toast.error('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOutFreela(ch) {
    try {
      // 1) marca concluído
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'concluido',
        checkOutConfirmadoPeloEstab: true,
        checkOutConfirmadoPeloEstabHora: serverTimestamp()
      })
      toast.success('⏳ Check-out do freela confirmado!')

      // 2) repasse 90% ao freela
      if (typeof ch.valorDiaria === 'number' && ch.valorDiaria > 0) {
        const functions = getFunctions()
        const pagarAoCheckout = httpsCallable(functions, 'pagarFreelaAoCheckout') // callable
        await pagarAoCheckout({
          chamadaId: ch.id,
          valorReceber: Number((ch.valorDiaria * 0.90).toFixed(2))
        }) // repasse via function
      }
    } catch (e) {
      console.error('[ChamadasContratante] confirmarCheckOutFreela erro:', e)
      toast.error('Erro ao confirmar check-out.')
    }
  }
  // ------------------------

  // ------------------------
  // 💳 Pagar com CARTÃO (senha → confirmarPagamentoComSenha → pagarFreela → registrarPagamentoEspelho)
  async function pagarComCartao(ch) {
    try {
      if (typeof ch.valorDiaria !== 'number' || ch.valorDiaria <= 0) {
        toast.error('Valor da diária inválido.')
        return
      }

      const senha = window.prompt('Digite sua senha de pagamento:')
      if (!senha) { toast('Pagamento cancelado.'); return }

      const functions = getFunctions()

      // 1) valida senha do pagador
      const confirmarSenha = httpsCallable(functions, 'confirmarPagamentoComSenha')
      await confirmarSenha({ uid: estab.uid, senha }) // valida hash no back (confirmarPagamentoComSenha)  ⟶ :contentReference[oaicite:10]{index=10}

      // 2) marcar a chamada como "pago" (retenção na plataforma)
      const pagar = httpsCallable(functions, 'pagarFreela')
      const r = await pagar({ chamadaId: ch.id }) // status 'pago' + pagamentoHora  ⟶ :contentReference[oaicite:11]{index=11}
      if (!r?.data?.sucesso) {
        toast.error('Falha ao processar pagamento.')
        return
      }

      // 3) registrar no espelho com o valor cobrado do contratante (diária + 10%)
      const registrar = httpsCallable(functions, 'registrarPagamentoEspelho')
      await registrar({
        chamadaId: ch.id,
        valor: Number((ch.valorDiaria * 1.10).toFixed(2)),
        metodo: 'cartao'
      }) // ⟶ :contentReference[oaicite:12]{index=12}

      // 4) reforça no doc e libera endereço ao freela (flag para UI do freela)
      await updateDoc(doc(db, 'chamadas', ch.id), {
        metodoPagamento: 'cartao',
        liberarEnderecoAoFreela: true // libera endereço pro freela
      })

      toast.success('💳 Pagamento com cartão confirmado!')
    } catch (e) {
      console.error('[ChamadasContratante] pagarComCartao erro:', e)
      toast.error(e?.message || 'Erro ao processar pagamento.')
    }
  }

  // 💸 Pix (HTTP: gerarPix) — exibe QR e copia/cola; endereço só libera quando status virar "pago"
  async function gerarPix(ch) {
    try {
      if (typeof ch.valorDiaria !== 'number' || ch.valorDiaria <= 0) {
        toast.error('Valor da diária inválido.')
        return
      }

      const base = import.meta.env.VITE_API_BASE_URL || ''
      const body = {
        valor: Number((ch.valorDiaria * 1.10).toFixed(2)), // diária + 10% do contratante
        nome: estab?.nome || estab?.nomeResponsavel || 'Contratante',
        cpf: estab?.cpf || estab?.documento || '',
        idChamada: ch.id
      }
      if (!body.cpf) {
        toast.error('CPF do pagador não encontrado no cadastro.')
        return
      }

      // tua rota HTTP (Express/Cloud Run)
      const resp = await fetch(`${base}/api/gerarPix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await resp.json()
      if (!resp.ok) {
        toast.error(data?.erro || 'Erro ao gerar Pix.')
        return
      }

      // guarda QR e copia/cola; mantém "aguardando" até webhook/validação confirmar
      await updateDoc(doc(db, 'chamadas', ch.id), {
        qrCodePix: data.imagemQrCode || null,
        copiaColaPix: data.qrCode || null,
        pagamentoStatus: 'aguardando_pix',
        metodoPagamento: 'pix'
      }) // gerarPix (HTTP) ⟶ :contentReference[oaicite:13]{index=13}

      // espelho com valor bruto
      const functions = getFunctions()
      const registrar = httpsCallable(functions, 'registrarPagamentoEspelho')
      await registrar({
        chamadaId: ch.id,
        valor: Number((ch.valorDiaria * 1.10).toFixed(2)),
        metodo: 'pix'
      }) // ⟶ :contentReference[oaicite:14]{index=14}

      toast.success('💸 Pix gerado! Aguarde a confirmação do pagamento.')
    } catch (e) {
      console.error('[ChamadasContratante] gerarPix erro:', e)
      toast.error(e?.message || 'Erro ao gerar Pix.')
    }
  }
  // ------------------------

  if (loading) return <div className="text-center text-orange-600 mt-8">🔄 Carregando chamadas…</div>
  if (!estab?.uid) return <div className="text-center text-red-600 mt-8">⚠️ Contratante não autenticado.</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      {/* 💳 Gestão de cartões (topo da página, sem interferir nos cards) */}
      <div className="bg-white shadow border border-orange-200 rounded-xl p-4 mb-4">
        <h2 className="text-lg font-semibold text-orange-700 mb-2">💳 Pagamentos do Contratante</h2>
        <p className="text-sm text-gray-700 mb-2">
          Cadastre/gerencie seus cartões e a senha de pagamento aqui. (listarCartao/salvarCartao/salvarSenha) 
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <ListaCartoes /> {/* ListaCartoes.jsx → subcoleção /usuarios/{uid}/cartoes  */}
          <SalvarSenhaCartao uid={estab?.uid} /> {/* salvarSenha (callable) */}
        </div>
      </div>

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa no momento.</p>
      ) : (
        chamadasOrdenadas.map((ch) => {
          const pos = ch.coordenadasCheckInFreela
          const dataHora = ch.checkInFeitoPeloFreelaHora?.seconds
            ? new Date(ch.checkInFeitoPeloFreelaHora.seconds * 1000).toLocaleString()
            : null

          return (
            <div key={ch.id} className="bg-white shadow p-4 rounded-xl mb-4 border border-orange-200 space-y-2">
              <h2 className="font-semibold text-orange-600 text-lg">Chamada #{ch?.id?.slice(-5)}</h2>
              <p><strong>Freela:</strong> {ch.freelaNome || ch.freelaUid}</p>
              <p><strong>Status:</strong> {ch.status}</p>
              {typeof ch.valorDiaria === 'number' && <p><strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}</p>}
              {ch.observacao && <p className="text-sm text-gray-800"><strong>📝 Observação:</strong> {ch.observacao}</p>}
              {dataHora && (<p className="text-sm text-gray-700">🕓 Check-in: {dataHora}</p>)}
              {ch.enderecoCheckInFreela && (<p className="text-sm text-gray-700">🏠 Endereço (do freela): {ch.enderecoCheckInFreela}</p>)}

              {pos && (
                <>
                  <p className="text-sm text-gray-700">
                    📍 Coordenadas: {pos.latitude?.toFixed?.(6)}, {pos.longitude?.toFixed?.(6)}{' '}
                    <a
                      href={`https://www.google.com/maps?q=${pos.latitude},${pos.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline ml-2"
                    >Ver no Google Maps</a>
                  </p>
                  <MapContainer center={[pos.latitude, pos.longitude]} zoom={18} scrollWheelZoom={false} style={{ height: 200, borderRadius: 8 }} className="mt-2">
                    <TileLayer attribution='&copy; OpenStreetMap' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                    <Marker position={[pos.latitude, pos.longitude]} />
                  </MapContainer>
                </>
              )}

              <MensagensRecebidasContratante chamadaId={ch.id} />

              {ch.status === 'concluido' && !ch.avaliadoPeloContratante && (
                <AvaliacaoContratante chamada={ch} />
              )}

              {/* 💸/💳 Pagamento — aparece quando 'aceita' (antes de confirmar chamada) */}
              {ch.status === 'aceita' && (
                <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => pagarComCartao(ch)}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      💳 Pagar com Cartão
                    </button>
                    <button
                      onClick={() => gerarPix(ch)}
                      className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                    >
                      💸 Gerar Pix
                    </button>
                  </div>

                  {/* Botões originais preservados */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => confirmarChamada(ch)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                      ✅ Confirmar Chamada
                    </button>
                    <button onClick={() => cancelarChamada(ch)} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                      ❌ Cancelar Chamada
                    </button>
                  </div>
                </div>
              )}

              {/* QR e Copia/Cola (se Pix foi gerado) — endereço só libera quando status virar 'pago' */}
              {(ch.qrCodePix || ch.copiaColaPix) && (
                <div className="bg-gray-50 border rounded-lg p-2 text-center space-y-2">
                  <p className="font-semibold text-green-600">✅ Pix gerado</p>
                  {ch.qrCodePix && <img src={ch.qrCodePix} alt="QR Code Pix" className="mx-auto w-40" />}
                  {ch.copiaColaPix && (<p className="text-xs break-all">{ch.copiaColaPix}</p>)}
                </div>
              )}

              {ch.status === 'checkin_freela' && (
                <button onClick={() => confirmarCheckInFreela(ch)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">📍 Confirmar check-in do freela</button>
              )}
              {ch.status === 'checkout_freela' && (
                <button onClick={() => confirmarCheckOutFreela(ch)} className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">⏳ Confirmar check-out do freela</button>
              )}
              {(ch.status === 'concluido' || ch.status === 'finalizada') && (
                <span className="text-green-600 font-bold block text-center mt-2">✅ Finalizada</span>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
