// src/components/VagasLista.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { db } from '@/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

function toMillis(v) {
  if (!v) return 0
  if (typeof v === 'number') return v
  if (typeof v?.toMillis === 'function') return v.toMillis()
  if (typeof v?.seconds === 'number') return v.seconds * 1000
  if (typeof v?._seconds === 'number') return v._seconds * 1000
  return 0
}
function fmtMoney(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function VagasLista({ filtroCidade, filtroFuncao }) {
  const [vagas, setVagas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const ref = collection(db, 'vagas')
    const unsub = onSnapshot(ref, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setVagas(lista)
      setCarregando(false)
    }, (e) => {
      console.error('Erro ao carregar vagas:', e)
      setErro('Não foi possível carregar as vagas agora.')
      setCarregando(false)
    })
    return () => unsub()
  }, [])

  const lista = useMemo(() => {
    let base = vagas.slice()

    // filtros opcionais
    if (filtroCidade?.trim()) {
      const f = filtroCidade.trim().toLowerCase()
      base = base.filter(v => (v.cidade || v.local || '').toLowerCase().includes(f))
    }
    if (filtroFuncao?.trim()) {
      const f = filtroFuncao.trim().toLowerCase()
      base = base.filter(v => (v.funcao || v.titulo || '').toLowerCase().includes(f))
    }

    // ordena por data (criadoEm/createdAt) desc
    base.sort((a, b) => toMillis(b.criadoEm ?? b.createdAt) - toMillis(a.criadoEm ?? a.createdAt))
    return base
  }, [vagas, filtroCidade, filtroFuncao])

  if (carregando) {
    return <p className="text-center text-gray-600 mt-8">Carregando vagas...</p>
  }
  if (erro) {
    return <p className="text-center text-red-600 mt-8">{erro}</p>
  }
  if (lista.length === 0) {
    return <p className="text-center text-gray-500 mt-8">Nenhuma vaga disponível no momento.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {lista.map((vaga, idx) => {
        const key = vaga.id || vaga.uid || `${vaga.titulo || 'vaga'}-${idx}`
        const isFreela = (vaga.tipo || '').toLowerCase() === 'freela'
        const salarioFmt = fmtMoney(vaga.salario ?? vaga.valor ?? (isFreela ? vaga.valorDiaria : undefined))

        return (
          <div key={key} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-xl mb-2">
              {vaga.titulo || vaga.funcao || 'Vaga sem título'}
            </h3>

            <div className="space-y-1 text-sm text-gray-700">
              {(vaga.funcao || vaga.cargo) && (
                <p><strong>Função:</strong> {vaga.funcao || vaga.cargo}</p>
              )}
              {(vaga.cidade || vaga.local) && (
                <p><strong>Local:</strong> {vaga.cidade || vaga.local}</p>
              )}
              {vaga.tipo && (
                <p><strong>Tipo:</strong> {vaga.tipo.toUpperCase()}</p>
              )}
              {salarioFmt && (
                <p><strong>{isFreela ? 'Diária' : 'Salário'}:</strong> {salarioFmt}</p>
              )}
            </div>

            {vaga.descricao && (
              <p className="text-gray-600 mt-3">{vaga.descricao}</p>
            )}

            {/* (Opcional) Botões de ação podem ser adicionados aqui */}
          </div>
        )
      })}
    </div>
  )
}
