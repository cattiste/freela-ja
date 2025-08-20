// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '@/firebase'

export default function DashboardAdmin() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [usuarios, setUsuarios] = useState([])

  const [totalChamadas, setTotalChamadas] = useState(0)
  const [chamadasAtivas, setChamadasAtivas] = useState(0)
  const [chamadasFaturadas, setChamadasFaturadas] = useState(0)
  const [faturamentoBruto, setFaturamentoBruto] = useState(0)

  useEffect(() => {
    if (!usuario || usuario.tipo !== 'admin') return

    const carregarChamadas = async () => {
      try {
        const snap = await getDocs(collection(db, 'chamadas'))
        const chamadasData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setChamadas(chamadasData)

        setTotalChamadas(chamadasData.length)

        const ativas = chamadasData.filter(c => ['aceita', 'checkin_freela', 'em_andamento'].includes(c.status)).length
        const concluido = chamadasData.filter(c => c.status === 'concluido')

        setChamadasAtivas(ativas)
        setChamadasFaturadas(concluido.length)

        const total = concluido.reduce((soma, c) => soma + (Number(c.valorDiaria) || 0), 0)
        setFaturamentoBruto(total)

      } catch (err) {
        console.error('Erro ao carregar chamadas:', err)
      }
    }

    const carregarUsuarios = async () => {
      try {
        const snap = await getDocs(collection(db, 'usuarios'))
        const usuariosData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setUsuarios(usuariosData)
      } catch (err) {
        console.error('Erro ao carregar usuários:', err)
      }
    }

    carregarChamadas()
    carregarUsuarios()
  }, [usuario])

  const ultimasChamadas = chamadas
    .sort((a, b) => b.criadoEm?.seconds - a.criadoEm?.seconds)
    .slice(0, 10)

  const chamadaPorStatus = (status) =>
    chamadas.filter(c => c.status === status)

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-orange-600">📊 Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold text-orange-700">Total de Chamadas</h2>
          <p className="text-2xl font-bold">{totalChamadas}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold text-green-700">Chamadas Ativas</h2>
          <p className="text-2xl font-bold">{chamadasAtivas}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold text-blue-700">Chamadas Faturadas</h2>
          <p className="text-2xl font-bold">{chamadasFaturadas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">💰 Faturamento Bruto</h2>
          <p className="text-2xl font-bold">R$ {faturamentoBruto.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">🧾 Comissão da Plataforma (20%)</h2>
          <p className="text-2xl font-bold">R$ {(faturamentoBruto * 0.2).toFixed(2)}</p>
        </div>
      </div>

      <div className="p-4 border rounded shadow">
        <h2 className="text-xl font-bold text-orange-600 mb-2">👥 Todos os Usuários</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">UID</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.nome}</td>
                <td className="p-2">{u.tipo}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 text-xs">{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border rounded shadow">
        <h2 className="text-xl font-bold text-orange-600 mb-2">📞 Últimas 10 Chamadas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Freela</th>
              <th className="text-left p-2">Contratante</th>
            </tr>
          </thead>
          <tbody>
            {ultimasChamadas.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2 text-xs">{c.id}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">{c.freelaNome}</td>
                <td className="p-2">{c.contratanteNome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border rounded shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['pendente', 'aceita', 'checkin_freela', 'em_andamento', 'checkout_freela', 'concluido', 'rejeitada', 'cancelada_por_falta_de_pagamento'].map((status) => (
          <div key={status} className="bg-gray-50 p-3 rounded border shadow">
            <h3 className="font-semibold mb-1 capitalize">📁 Chamadas: {status.replaceAll('_', ' ')}</h3>
            <p className="text-lg font-bold">{chamadaPorStatus(status).length}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
