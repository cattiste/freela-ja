// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function DashboardAdmin() {
  const { usuario } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario || usuario.tipo !== 'admin') return

    // 🔹 Carregar todos os usuários
    const fetchUsuarios = async () => {
      try {
        const q = query(collection(db, 'usuarios'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUsuarios(lista)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      }
    }

    // 🔹 Carregar todas as chamadas
    const fetchChamadas = async () => {
      try {
        const q = query(collection(db, 'chamadas'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setChamadas(lista)
      } catch (error) {
        console.error('Erro ao buscar chamadas:', error)
      }
    }

    fetchUsuarios()
    fetchChamadas()
  }, [usuario])

  // 🔢 Totais
  const totalChamadas = chamadas.length
  const chamadasAtivas = chamadas.filter((c) =>
    ['aceita', 'em_andamento', 'checkin_freela'].includes(c.status)
  ).length
  const chamadasFaturadas = chamadas.filter((c) => c.status === 'concluido').length

  const faturamentoBruto = chamadas
    .filter((c) => c.valorDiaria)
    .reduce((acc, cur) => acc + Number(cur.valorDiaria), 0)

  const comissao = faturamentoBruto * 0.2

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📊 Painel Administrativo</h1>

      {/* RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border p-4 rounded-xl border-orange-300 text-orange-800">
          <h2 className="font-semibold">Total de Chamadas</h2>
          <p className="text-2xl">{totalChamadas}</p>
        </div>
        <div className="border p-4 rounded-xl border-green-300 text-green-800">
          <h2 className="font-semibold">Chamadas Ativas</h2>
          <p className="text-2xl">{chamadasAtivas}</p>
        </div>
        <div className="border p-4 rounded-xl border-blue-300 text-blue-800">
          <h2 className="font-semibold">Chamadas Faturadas</h2>
          <p className="text-2xl">{chamadasFaturadas}</p>
        </div>
      </div>

      {/* FATURAMENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border p-4 rounded-xl border-yellow-300">
          <h2 className="font-semibold mb-1">💰 Faturamento Bruto</h2>
          <p className="text-xl font-bold">R$ {faturamentoBruto.toFixed(2)}</p>
        </div>
        <div className="border p-4 rounded-xl border-indigo-300">
          <h2 className="font-semibold mb-1">🧾 Comissão da Plataforma (20%)</h2>
          <p className="text-xl font-bold">R$ {comissao.toFixed(2)}</p>
        </div>
      </div>

      {/* ÚLTIMAS 10 CHAMADAS */}
      <div className="border p-4 rounded-xl mb-6">
        <h2 className="font-semibold text-orange-700 mb-2">🙋‍♂️ Últimas 10 Chamadas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left">ID</th>
              <th>Status</th>
              <th>Freela</th>
              <th>Contratante</th>
            </tr>
          </thead>
          <tbody>
            {[...chamadas].reverse().slice(0, 10).map((c) => (
              <tr key={c.id} className="border-b">
                <td>{c.id}</td>
                <td>{c.status}</td>
                <td>{c.freelaUid}</td>
                <td>{c.contratanteUid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LISTA DE USUÁRIOS */}
      <div className="border p-4 rounded-xl mb-6">
        <h2 className="font-semibold text-blue-800 mb-2">👥 Todos os Usuários</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left">Nome</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>UID</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b">
                <td>{u.nome}</td>
                <td>{u.tipo}</td>
                <td>{u.email}</td>
                <td>{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHAMADAS POR STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['pendente', 'aceita', 'checkin_freela', 'em_andamento', 'checkout_freela', 'concluido', 'rejeitada', 'cancelada_por_falta_de_pagamento'].map((status) => (
          <div key={status} className="border p-4 rounded-xl">
            <h2 className="font-semibold">📁 Chamadas: {status.replace(/_/g, ' ').toUpperCase()}</h2>
            <ul className="list-disc ml-4">
              {chamadas.filter((c) => c.status === status).map((c) => (
                <li key={c.id}>{c.id}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
