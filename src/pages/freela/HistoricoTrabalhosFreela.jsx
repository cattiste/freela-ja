// src/pages/freela/HistoricoTrabalhosFreela.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

function toMillis(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  if (typeof v?.toMillis === 'function') return v.toMillis()
  if (typeof v?.seconds === 'number') return v.seconds * 1000
  if (typeof v?._seconds === 'number') return v._seconds * 1000
  return 0
}
function fmtData(v) {
  try {
    const d = typeof v?.toDate === 'function' ? v.toDate() : new Date(toMillis(v))
    return Number.isFinite(d?.getTime()) ? d.toLocaleString('pt-BR') : '—'
  } catch {
    return '—'
  }
}
function fmtMoney(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function HistoricoTrabalhosFreela({ freelaUid }) {
  const { usuario } = useAuth()
  const uid = freelaUid || usuario?.uid

  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!uid) return
    // Considera chamados concluídos (pagos) e também os que já fizeram checkout
    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', uid),
      where('status', 'in', ['checkout_freela', 'concluido'])
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista = snap.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data, // <<<<<< CORRETO (sem ".data")
          }
        })
        setItens(lista)
        setCarregando(false)
      },
      (err) => {
        console.error('[HistoricoTrabalhosFreela] erro ao carregar:', err)
        setItens([])
        setCarregando(false)
      }
    )
    return () => unsub()
  }, [uid])

  const totais = useMemo(() => {
    // total recebido: apenas status concluído (quando há pagamento confirmado)
    const concluidas = itens.filter((i) => i.status === 'concluido')
    const totalRecebido = concluidas.reduce((acc, cur) => {
      const v = Number(cur.valorPago ?? cur.valorDiaria ?? 0)
      return acc + (Number.isFinite(v) ? v : 0)
    }, 0)

    // quantidade por status
    const qtdConcluidas = concluidas.length
    const qtdCheckout = itens.filter((i) => i.status === 'checkout_freela').length

    return { totalRecebido, qtdConcluidas, qtdCheckout }
  }, [itens])

  if (!uid) {
    return (
      <div className="text-center text-red-600 mt-8">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="text-center text-orange-600 mt-8">
        Carregando histórico de trabalhos...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow p-4 border border-orange-200">
        <h2 className="text-xl font-bold text-orange-700">📚 Histórico de Trabalhos</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded bg-green-50 border border-green-200">
            <p className="text-green-700 font-semibold">Total Recebido</p>
            <p className="text-lg font-bold">{fmtMoney(totais.totalRecebido)}</p>
          </div>
          <div className="p-3 rounded bg-blue-50 border border-blue-200">
            <p className="text-blue-700 font-semibold">Concluídos</p>
            <p className="text-lg font-bold">{totais.qtdConcluidas}</p>
          </div>
          <div className="p-3 rounded bg-indigo-50 border border-indigo-200">
            <p className="text-indigo-700 font-semibold">Com Check-out</p>
            <p className="text-lg font-bold">{totais.qtdCheckout}</p>
          </div>
        </div>
      </div>

      {itens.length === 0 ? (
        <p className="text-center text-gray-600">Nenhum trabalho encontrado.</p>
      ) : (
        <div className="space-y-3">
          {itens
            .slice()
            .sort((a, b) => toMillis(b.checkOutFreelaHora ?? b.criadoEm) - toMillis(a.checkOutFreelaHora ?? a.criadoEm))
            .map((i) => {
              const valor = Number(i.valorPago ?? i.valorDiaria ?? 0)
              return (
                <div
                  key={i.id}
                  className="bg-white rounded-xl shadow p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {i.vagaTitulo || i.freelaFuncao || 'Trabalho'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {i.contratanteNome || 'Contratante não informado'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        i.status === 'concluido'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {String(i.status || '').replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <p><strong>Aberta:</strong> {fmtData(i.criadoEm)}</p>
                    {i.checkInFreelaHora && <p><strong>Check-in:</strong> {fmtData(i.checkInFreelaHora)}</p>}
                    {i.checkOutFreelaHora && <p><strong>Check-out:</strong> {fmtData(i.checkOutFreelaHora)}</p>}
                  </div>

                  <div className="mt-2 text-sm">
                    <strong>Valor:</strong> {Number.isFinite(valor) ? fmtMoney(valor) : '—'}
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
