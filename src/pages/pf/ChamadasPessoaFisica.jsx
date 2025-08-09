// src/pages/pf/ChamadasPessoaFisica.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore'
import { db } from '@/firebase'


const STATUS_LIST = ['pendente', 'aceita', 'checkin_freela', 'checkout_freela', 'checkin_estabelecimento']

function StatusBadge({ status }) {
  const map = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aceita: 'bg-blue-100 text-blue-800',
    checkin_freela: 'bg-indigo-100 text-indigo-800',
    checkin_estabelecimento: 'bg-purple-100 text-purple-800',
    checkout_freela: 'bg-teal-100 text-teal-800',
    concluido: 'bg-green-100 text-green-800',
    cancelada: 'bg-gray-200 text-gray-700',
    rejeitada: 'bg-red-100 text-red-800'
  }
  const cls = map[status] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

function formatarData(ts) {
  try {
    if (!ts) return '-'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('pt-BR')
  } catch {
    return '-'
  }
}

export default function ChamadasPessoaFisica({ embed = false }) {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Busca as chamadas criadas pela PF (usando o mesmo campo do estabelecimento)
  useEffect(() => {
    if (!usuario?.uid) return
    setCarregando(true)

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', usuario.uid), // ⚠ mantemos o mesmo campo
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela', 'checkin_estabelecimento']),
      orderBy('criadoEm', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const arr = []
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }))
      setChamadas(arr)
      setCarregando(false)
    })

    return () => unsub()
  }, [usuario?.uid])

  const chamadasOrdenadas = useMemo(() => {
    // Só para garantir ordem consistente caso falte algum campo
    return [...chamadas].sort((a, b) => {
      const da = a.criadoEm?.toMillis?.() || 0
      const dbm = b.criadoEm?.toMillis?.() || 0
      return dbm - da
    })
  }, [chamadas])

  async function confirmarCheckIn(chamada) {
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        checkInEstabelecimento: true,
        status: 'checkin_estabelecimento',
        atualizadoEm: new Date()
      })
    } catch (e) {
      console.error('Erro ao confirmar check-in:', e)
      alert('Não foi possível confirmar o check-in. Verifique as regras/permissões.')
    }
  }

  async function confirmarCheckOut(chamada) {
    try {
      const ref = doc(db, 'chamadas', chamada.id)
      await updateDoc(ref, {
        checkOutEstabelecimento: true,
        status: 'concluido',
        atualizadoEm: new Date()
      })
    } catch (e) {
      console.error('Erro ao confirmar check-out:', e)
      alert('Não foi possível confirmar o check-out. Verifique as regras/permissões.')
    }
  }

  function botaoCheckInHabilitado(ch) {
    // PF só confirma check-in DEPOIS do check-in do freela
    if (ch?.status !== 'checkin_freela' && ch?.status !== 'aceita') return false
    // se já confirmou, desabilita
    if (ch?.checkInEstabelecimento) return false
    // se freela marcou check-in (flag)
    if (ch?.checkInFreela || ch?.status === 'checkin_freela') return true
    return false
  }

  function botaoCheckOutHabilitado(ch) {
    // PF só confirma check-out DEPOIS do check-out do freela
    if (ch?.status !== 'checkout_freela') return false
    if (ch?.checkOutEstabelecimento) return false
    if (ch?.checkOutFreela || ch?.status === 'checkout_freela') return true
    return false
  }

  if (carregando) {
    return <div className="text-sm text-gray-600">Carregando chamadas...</div>
  }

  if (!chamadasOrdenadas.length) {
    return <div className="text-sm text-gray-600">Nenhuma chamada ativa no momento.</div>
  }

  return (
    <div className={embed ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
      {chamadasOrdenadas.map((ch) => (
        <div key={ch.id} className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={ch.freelaFotoURL || 'https://placehold.co/80x80?text=FL'}
                alt="Freela"
                className="w-16 h-16 rounded-xl object-cover border"
              />
              <div>
                <div className="font-semibold text-base">
                  {ch.freelaNome || 'Profissional'}
                </div>
                <div className="text-sm text-gray-600">
                  {ch.funcao || ch.especialidade || 'Função não informada'}
                </div>
                <div className="text-xs text-gray-500">
                  criada em {formatarData(ch.criadoEm)}
                </div>
              </div>
            </div>
            <StatusBadge status={ch.status} />
          </div>

          {/* Observação (instruções) */}
          {ch?.observacao ? (
            <div className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Observação: </span>
              {ch.observacao
