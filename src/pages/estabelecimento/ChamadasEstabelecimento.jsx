// src/pages/estabelecimento/ChamadasEstabelecimento.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, onSnapshot,
  updateDoc, addDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'
import AvaliacaoInline from '@/components/AvaliacaoInline'
import MensagensRecebidasEstabelecimento from '@/components/MensagensRecebidasEstabelecimento'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [loadingId, setLoadingId] = useState(null)
  const [err, setErr] = useState('')

  // --- Nova chamada rápida (para testar criação no Firestore)
  const [novoFreelaUid, setNovoFreelaUid] = useState('')
  const [novoFuncao, setNovoFuncao] = useState('')
  const [novoValor, setNovoValor] = useState('')

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', [
        'pendente', 'aceita', 'checkin_freela', 'em_andamento',
        'checkout_freela', 'concluido', 'finalizada', 'rejeitada',
        'cancelada_por_falta_de_pagamento'
      ])
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // de-dupe por freela, ficando com a mais recente
        const byFreela = new Map()
        for (const c of docs) {
          const k = c.freelaUid || c.freela?.uid || c.id
          const prev = byFreela.get(k)
          const ts = c.criadoEm?.toMillis?.() ?? c.criadoEm?.seconds * 1000 ?? 0
          const prevTs = prev ? (prev.criadoEm?.toMillis?.() ?? prev.criadoEm?.seconds * 1000 ?? 0) : -1
          if (!prev || ts > prevTs) byFreela.set(k, c)
        }
        const lista = Array.from(byFreela.values()).sort((a, b) => {
          const ta = a.criadoEm?.toMillis?.() ?? a.criadoEm?.seconds * 1000 ?? 0
          const tb = b.criadoEm?.toMillis?.() ?? b.criadoEm?.seconds * 1000 ?? 0
          return tb - ta
        })
        setChamadas(lista)
        setErr('')
      },
      (e) => {
        console.error('[ChamadasEstabelecimento] onSnapshot erro:', e)
        setErr('Falha ao carregar suas chamadas.')
      }
    )

    return () => unsub()
  }, [estabelecimento?.uid])

  async function criarChamadaRapida() {
    if (!estabelecimento?.uid) {
      toast.error('Estabelecimento não identificado.')
      return
    }
    if (!novoFreelaUid.trim()) {
      toast.error('Informe o UID do freela.')
      return
    }
    try {
      const payload = {
        // chaves de relação
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento?.nome || '',
        freelaUid: novoFreelaUid.trim(),

        // detalhes
        funcao: (novoFuncao || '').trim(),
        valorDiaria: novoValor ? Number(novoValor) : null,
        observacao: '',

        // status inicial
        status: 'pendente',

        // timestamps
        criadoEm: serverTimestamp(),

        // flags de fluxo
        checkInFreela: false,
        checkInEstabelecimento: false,
        checkOutFreela: false,
        checkOutEstabelecimento: false,
      }

      const ref = await addDoc(collection(db, 'chamadas'), payload)

      // (Opcional) mensagem inicial na subcoleção
      try {
        await addDoc(collection(db, 'chamadas', ref.id, 'mensagens'), {
          autor: 'estabelecimento',
          estabelecimentoUid: estabelecimento.uid,
          texto: 'Olá! Convite enviado pelo estabelecimento.',
          criadoEm: serverTimestamp(),
        })
      } catch (e) {
        console.warn('[ChamadasEstabelecimento] mensagem inicial falhou:', e)
      }

      toast.success('Chamada criada!')
      setNovoFreelaUid('')
      setNovoFuncao('')
      setNovoValor('')
    } catch (e) {
      console.error('[ChamadasEstabelecimento] criarChamada erro:', e)
      toast.error('Não foi possível criar a chamada.')
    }
  }

  const atualizarChamada = async (id, dados) => {
    try {
      setLoadingId(id)
      await updateDoc(doc(db, 'chamadas', id), dados)
      toast.success('✅ Ação realizada com sucesso!')
    } catch (err) {
      console.error('[ChamadasEstabelecimento] update erro:', err)
      toast.error(err?.message || 'Erro ao atualizar chamada.')
    } finally {
      setLoadingId(null)
    }
  }

  const badgeStatus = (status) => {
    const cores = {
      pendente: 'bg-orange-200 text-orange-700',
      aceita: 'bg-yellow-200 text-yellow-700',
      checkin_freela: 'bg-purple-200 text-purple-700',
      em_andamento: 'bg-green-200 text-green-700',
      checkout_freela: 'bg-blue-200 text-blue-700',
      concluido: 'bg-gray-200 text-gray-700',
      finalizada: 'bg-gray-200 text-gray-700',
      rejeitada: 'bg-red-200 text-red-700',
      cancelada_por_falta_de_pagamento: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cores[status] || 'bg-gray-200 text-gray-700'}`}>
        {String(status || '').replaceAll('_', ' ')}
      </span>
    )
  }

  if (err) {
    return <div className="text-center mt-6 text-red-600">{err}</div>
  }

  return (
    <div className="space-y-6">
      {/* --- Nova chamada rápida (teste de criação) --- */}
      <div className="bg-white rounded-xl p-4 border border-orange-200">
        <h3 className="font-semibold mb-2 text-orange-700">Nova chamada rápida (teste)</h3>
        <div className="grid sm:grid-cols-4 gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="freelaUid"
            value={novoFreelaUid}
            onChange={(e) => setNovoFreelaUid(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="função (ex.: garçom)"
            value={novoFuncao}
            onChange={(e) => setNovoFuncao(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="valor diária (opcional)"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
          />
          <button
            onClick={criarChamadaRapida}
            className="bg-orange-600 text-white rounded px-3 py-2 hover:bg-orange-700"
          >
            Chamar freela
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">* Apenas para validar criação; depois você pode mover isso para a tela de busca/seleção de freelas.</p>
      </div>

      {/* --- Lista de chamadas --- */}
      {chamadas.length === 0 ? (
        <div className="text-center mt-6 text-gray-500">Nenhuma chamada ativa no momento.</div>
      ) : (
        <div className="space-y-4">
          {chamadas.map((chamada) => {
            const foto = chamada.freelaFoto || chamada.freela?.foto || 'https://placehold.co/100x100'
            const nome = chamada.freelaNome || chamada.freela?.nome || 'Nome não informado'

            return (
              <div key={chamada.id} className="bg-white rounded-xl p-3 shadow border border-orange-100 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={foto}
                    alt={nome}
                    className="w-10 h-10 rounded-full border border-orange-300 object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-orange-600">{nome}</p>
                    {chamada.valorDiaria && (
                      <p className="text-xs text-gray-500">💰 R$ {Number(chamada.valorDiaria).toFixed(2)} / diária</p>
                    )}
                    <p className="text-sm mt-1">📌 Status: {badgeStatus(chamada.status)}</p>
                    <MensagensRecebidasEstabelecimento chamadaId={chamada.id} />
                  </div>
                </div>

                {/* fluxo */}
                {chamada.status === 'pendente' && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        atualizarChamada(chamada.id, {
                          status: 'aceita',
                          aceitaEm: serverTimestamp()
                        })
                      }
                      disabled={loadingId === chamada.id}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar convite (aceita)'}
                    </button>
                    <button
                      onClick={() =>
                        atualizarChamada(chamada.id, {
                          status: 'rejeitada',
                          rejeitadaEm: serverTimestamp()
                        })
                      }
                      disabled={loadingId === chamada.id}
                      className="w-full bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                    >
                      {loadingId === chamada.id ? 'Processando...' : '❌ Cancelar convite'}
                    </button>
                  </div>
                )}

                {chamada.checkInFreela === true && !chamada.checkInEstabelecimento && (
                  <button
                    onClick={() =>
                      atualizarChamada(chamada.id, {
                        checkInEstabelecimento: true,
                        checkInEstabelecimentoHora: serverTimestamp(),
                        status: 'em_andamento'
                      })
                    }
                    disabled={loadingId === chamada.id}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loadingId === chamada.id ? 'Confirmando...' : '✅ Confirmar Check-in do freela'}
                  </button>
                )}

                {chamada.checkOutFreela === true && !chamada.checkOutEstabelecimento && (
                  <button
                    onClick={() =>
                      atualizarChamada(chamada.id, {
                        checkOutEstabelecimento: true,
                        checkOutEstabelecimentoHora: serverTimestamp(),
                        status: 'concluido'
                      })
                    }
                    disabled={loadingId === chamada.id}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loadingId === chamada.id ? 'Confirmando...' : '📤 Confirmar Check-out'}
                  </button>
                )}

                {chamada.status === 'concluido' && (
                  <AvaliacaoInline chamada={chamada} tipo="estabelecimento" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
