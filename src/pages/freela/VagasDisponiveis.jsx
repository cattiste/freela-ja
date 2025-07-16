// src/pages/freela/VagasDisponiveis.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

function formatarData(timestamp) {
  if (!timestamp) return 'Não informado'
  if (timestamp.seconds) {
    const data = new Date(timestamp.seconds * 1000)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  return new Date(timestamp).toLocaleDateString('pt-BR')
}

export default function VagasDisponiveis({ freela }) {
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const [candidaturas, setCandidaturas] = useState([])
  const [vagasExcluidas, setVagasExcluidas] = useState(new Set())

  // Protege acesso
  if (!freela?.uid) {
    return (
      <div className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  useEffect(() => {
    async function carregarVagas() {
      setLoading(true)
      setErro(null)
      setSucesso(null)
      try {
        // Listar apenas vagas abertas
        const q = query(
          collection(db, 'vagas'),
          where('status', '==', 'aberta')
        )
        const snapshot = await getDocs(q)
        const listaVagas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

        // Buscar candidaturas do usuário
        const qCand = query(
          collection(db, 'candidaturas'),
          where('freelaUid', '==', freela.uid)
        )
        const snapCand = await getDocs(qCand)
        const listaCandidaturas = snapCand.docs.map(c => ({ id: c.id, ...c.data() }))

        setVagas(listaVagas)
        setCandidaturas(listaCandidaturas)
      } catch (err) {
        console.error('Erro ao carregar vagas:', err)
        setErro('Erro ao carregar vagas. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    carregarVagas()
  }, [freela.uid])

  async function handleCandidatar(vaga) {
    if (!freela.uid) {
      setErro('Você precisa estar logado para se candidatar.')
      return
    }
    setErro(null)
    setSucesso(null)
    try {
      await addDoc(collection(db, 'candidaturas'), {
        vagaId: vaga.id,
        estabelecimentoUid: vaga.estabelecimentoUid,
        freelaUid: freela.uid,
        dataCandidatura: serverTimestamp(),
        status: 'pendente',
        mensagem: '',
        contato: '',
      })
      setSucesso(`Candidatura enviada para vaga: ${vaga.titulo}`)
      setCandidaturas(prev => [...prev, { vagaId: vaga.id, status: 'pendente' }])
      setVagasExcluidas(prev => {
        const copy = new Set(prev)
        copy.add(vaga.id)
        return copy
      })
    } catch (err) {
      console.error('Erro ao candidatar:', err)
      setErro('Erro ao enviar candidatura. Tente novamente.')
    }
  }

  async function handleExcluirCandidatura(id, vagaId) {
    if (!window.confirm('Tem certeza que deseja excluir esta candidatura?')) return
    try {
      await deleteDoc(doc(db, 'candidaturas', id))
      setCandidaturas(prev => prev.filter(c => c.id !== id))
      setVagasExcluidas(prev => new Set(prev).add(vagaId))
      setSucesso('Candidatura excluída com sucesso!')
      setErro(null)
    } catch {
      setErro('Erro ao excluir candidatura. Tente novamente.')
      setSucesso(null)
    }
  }

  function getCandidaturaDaVaga(vagaId) {
    return candidaturas.find(c => c.vagaId === vagaId)
  }

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando vagas disponíveis...
      </div>
    )
  }

  return (
    <div className="max-w-full p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">
        🎯 Vagas Disponíveis
      </h2>

      {erro && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 relative">{erro}</div>}
      {sucesso && <div className="mb-4 p-3 rounded bg-green-100 text-green-700 relative">{sucesso}</div>}

      {vagas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma vaga disponível no momento.</p>
      ) : (
        <div className="space-y-6">
          {vagas.map(vaga => {
            const candidatura = getCandidaturaDaVaga(vaga.id)
            const isExcluida = vagasExcluidas.has(vaga.id)
            const isUrgente = vaga.urgente

            return (
              <div
                key={vaga.id}
                className={`p-5 border rounded-xl shadow ${
                  isUrgente ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <h3 className="text-xl font-semibold text-orange-700 mb-2">
                  {vaga.titulo || vaga.funcao}
                </h3>

                {isExcluida ? (
                  <p className="text-red-600 font-semibold mt-2">
                    Candidatura excluída - Você não pode se candidatar novamente.
                  </p>
                ) : (
                  <>
                    <p><strong>Tipo:</strong> {vaga.tipo === 'clt' ? 'CLT (Fixa)' : 'Freela (Diária)'}</p>
                    {vaga.tipo === 'freela' && vaga.valorDiaria != null && (
                      <p>
                        <strong>Valor da diária:</strong> R$ {Number(vaga.valorDiaria).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    {vaga.tipo === 'clt' && vaga.salario != null && (
                      <p>
                        <strong>Salário:</strong> R$ {Number(vaga.salario).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    <p><strong>Data da publicação:</strong> {formatarData(vaga.dataPublicacao)}</p>
                    {vaga.descricao && <p className="mt-2 text-gray-700"><strong>Descrição:</strong> {vaga.descricao}</p>}
                    {vaga.urgente && <p className="text-red-600 font-semibold mt-3 uppercase tracking-wide">URGENTE</p>}

                    {candidatura ? (
                      <p className="mt-4 font-semibold">
                        Status: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">{candidatura.status.toUpperCase()}</span>
                      </p>
                    ) : (
                      <button
                        onClick={() => handleCandidatar(vaga)}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
                      >
                        Candidatar-se
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
