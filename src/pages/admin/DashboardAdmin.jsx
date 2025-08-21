import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'

export default function DashboardAdmin() {
  const { usuario } = useAuth()
  const [abaSelecionada, setAbaSelecionada] = useState('resumo')

  const [usuarios, setUsuarios] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [pendentes, setPendentes] = useState([])

  useEffect(() => {
    if (!usuario || usuario.tipo !== 'admin') return

    const fetchUsuarios = async () => {
      try {
        const q = query(collection(db, 'usuarios'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUsuarios(lista)

        const listaPendentes = snapshot.docs
          .filter(doc => doc.data().validacao === 'pendente')
          .map(doc => ({ id: doc.id, ...doc.data() }))
        setPendentes(listaPendentes)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      }
    }

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

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await updateDoc(doc(db, 'usuarios', id), { validacao: novoStatus })
      setPendentes((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error('Erro ao atualizar status de validação:', err)
    }
  }

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'resumo': {
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-xl border-yellow-300">
                <h2 className="font-semibold mb-1">💰 Faturamento Bruto</h2>
                <p className="text-xl font-bold">R$ {faturamentoBruto.toFixed(2)}</p>
              </div>
              <div className="border p-4 rounded-xl border-indigo-300">
                <h2 className="font-semibold mb-1">🧾 Comissão da Plataforma (20%)</h2>
                <p className="text-xl font-bold">R$ {comissao.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )
      }

      case 'chamadas': {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'pendente',
              'aceita',
              'checkin_freela',
              'em_andamento',
              'checkout_freela',
              'concluido',
              'rejeitada',
              'cancelada_por_falta_de_pagamento',
            ].map((status) => (
              <div key={status} className="border p-4 rounded-xl">
                <h2 className="font-semibold">📁 Chamadas: {status.replace(/_/g, ' ').toUpperCase()}</h2>
                <ul className="list-disc ml-4 text-sm">
                  {chamadas.filter((c) => c.status === status).map((c) => (
                    <li key={c.id}>{c.id}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      }

      case 'validador': {
        if (pendentes.length === 0) return <p className="text-sm text-gray-500">Nenhuma validação pendente.</p>

        return (
          <div className="grid md:grid-cols-2 gap-6">
            {pendentes.map((usuario) => (
              <div key={usuario.id} className="border rounded-lg p-4 shadow-sm bg-white">
                <p className="font-semibold mb-2">
                  {usuario.nome || 'Sem nome'} ({usuario.email})
                </p>
                <div className="flex gap-4 mb-4">
                  <img src={usuario.documentoFrente} alt="Frente" className="w-40 rounded border" />
                  <img src={usuario.documentoVerso} alt="Verso" className="w-40 rounded border" />
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                    onClick={() => atualizarStatus(usuario.id, 'aprovada')}
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                    onClick={() => atualizarStatus(usuario.id, 'reprovada')}
                  >
                    ❌ Reprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      case 'usuarios': {
        return (
          <div className="overflow-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
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
                    <td className="p-2">{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📊 Painel Administrativo</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={() => setAbaSelecionada('resumo')} className={abaSelecionada === 'resumo' ? 'bg-orange-600 text-white px-4 py-2 rounded' : 'bg-gray-100 px-4 py-2 rounded'}>
          Resumo
        </button>
        <button onClick={() => setAbaSelecionada('chamadas')} className={abaSelecionada === 'chamadas' ? 'bg-orange-600 text-white px-4 py-2 rounded' : 'bg-gray-100 px-4 py-2 rounded'}>
          Chamadas
        </button>
        <button onClick={() => setAbaSelecionada('validador')} className={abaSelecionada === 'validador' ? 'bg-orange-600 text-white px-4 py-2 rounded' : 'bg-gray-100 px-4 py-2 rounded'}>
          Validações
        </button>
        <button onClick={() => setAbaSelecionada('usuarios')} className={abaSelecionada === 'usuarios' ? 'bg-orange-600 text-white px-4 py-2 rounded' : 'bg-gray-100 px-4 py-2 rounded'}>
          Usuários
        </button>
      </div>

      {renderConteudo()}
    </div>
  )
}
