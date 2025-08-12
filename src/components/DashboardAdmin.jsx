// src/components/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'admin2025'

function toMillis(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  if (typeof v?.toMillis === 'function') return v.toMillis()
  if (typeof v?.seconds === 'number') return v.seconds * 1000
  if (typeof v?._seconds === 'number') return v._seconds * 1000
  return 0
}

export default function DashboardAdmin() {
  const [senha, setSenha] = useState('')
  const [acessoLiberado, setAcessoLiberado] = useState(false)
  const [chamadas, setChamadas] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    if (!acessoLiberado) return

    const unsubChamadas = onSnapshot(collection(db, 'chamadas'), (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      lista.sort((a, b) => toMillis(b.criadoEm) - toMillis(a.criadoEm))
      setChamadas(lista)
    })

    const unsubUsuarios = onSnapshot(collection(db, 'usuarios'), (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsuarios(lista)
    })

    return () => {
      unsubChamadas()
      unsubUsuarios()
    }
  }, [acessoLiberado])

  const chamadasAtivas = chamadas.filter(c =>
    ['pendente', 'aceita', 'checkin_freela', 'em_andamento'].includes(c.status)
  )

  const chamadasFaturadas = chamadas.filter(c => c.status === 'concluido')
  const faturamentoBruto = chamadasFaturadas.reduce((acc, cur) => {
    const valor = Number(cur.valor ?? cur.valorDiaria ?? 0)
    return acc + (Number.isFinite(valor) ? valor : 0)
  }, 0)
  const faturamentoComissao = faturamentoBruto * 0.20

  if (!acessoLiberado) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center space-y-4">
        <h2 className="text-xl font-semibold text-orange-600">🔐 Painel Administrativo</h2>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded"
          placeholder="Digite a senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button
          onClick={() => setAcessoLiberado(senha === ADMIN_PASS)}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          Entrar
        </button>
        {senha && senha !== ADMIN_PASS && <p className="text-red-500 text-sm">Senha incorreta</p>}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">📊 Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-600">Total de Chamadas</h2>
          <p className="text-3xl font-bold text-gray-800">{chamadas.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-green-200">
          <h2 className="text-xl font-semibold text-green-600">Chamadas Ativas</h2>
          <p className="text-3xl font-bold text-gray-800">{chamadasAtivas.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-blue-300">
          <h2 className="text-xl font-semibold text-blue-700">Chamadas Faturadas</h2>
          <p className="text-3xl font-bold text-gray-800">{chamadasFaturadas.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-yellow-300">
          <h2 className="text-xl font-semibold text-yellow-700">💰 Faturamento Bruto</h2>
          <p className="text-3xl font-bold text-gray-800">R$ {faturamentoBruto.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-indigo-300">
          <h2 className="text-xl font-semibold text-indigo-700">🧾 Comissão da Plataforma (20%)</h2>
          <p className="text-3xl font-bold text-gray-800">R$ {faturamentoComissao.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border border-orange-100 mb-6">
        <h2 className="text-xl font-semibold text-orange-600 mb-3">🧑‍💼 Últimas 10 Chamadas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>ID</th>
              <th>Status</th>
              <th>Freela</th>
              <th>Estabelecimento</th>
            </tr>
          </thead>
          <tbody>
            {chamadas.slice(0, 10).map((chamada) => (
              <tr key={chamada.id} className="border-b hover:bg-gray-50">
                <td className="py-1">#{chamada.id.slice(-5)}</td>
                <td>{chamada.status || '-'}</td>
                <td>{chamada.freelaNome || '-'}</td>
                <td>{chamada.estabelecimentoNome || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border border-blue-100 mb-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-3">👥 Todos os Usuários</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Nome</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>UID</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td>{user.nome || '-'}</td>
                <td>{user.tipo || '-'}</td>
                <td>{user.email || '-'}</td>
                <td className="text-xs text-gray-500">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['pendente', 'aceita', 'checkin_freela', 'em_andamento', 'checkout_freela', 'concluido', 'rejeitada', 'cancelada_por_falta_de_pagamento'].map((status) => (
          <div key={status} className="bg-white p-4 rounded-xl shadow border">
            <h2 className="text-lg font-semibold text-gray-700 capitalize mb-2">📂 Chamadas: {status.replaceAll('_', ' ')}</h2>
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
              {chamadas.filter(c => c.status === status).map(c => (
                <li key={c.id} className="border-b pb-1">#{c.id.slice(-5)} - {c.freelaNome || '-'} → {c.estabelecimentoNome || '-'}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
