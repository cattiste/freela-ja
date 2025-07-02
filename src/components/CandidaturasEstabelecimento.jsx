import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function CandidaturasEstabelecimento({ estabelecimentoUid }) {
  const [candidaturas, setCandidaturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarCandidaturas() {
      setLoading(true)
      setErro(null)
      try {
        // Buscar candidaturas do estabelecimento (status pendente, aprovado ou rejeitado)
        const q = query(
          collection(db, 'candidaturas'),
          where('estabelecimentoUid', '==', estabelecimentoUid)
        )
        const snapshot = await getDocs(q)
        const lista = []

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          // Buscar dados da vaga vinculada (para mostrar título, função etc)
          const vagaRef = doc(db, 'vagas', data.vagaId)
          const vagaSnap = await getDocs(query(collection(db, 'vagas'), where('__name__', '==', data.vagaId)))
          const vagaData = vagaSnap.docs.length > 0 ? vagaSnap.docs[0].data() : null

          lista.push({
            id: docSnap.id,
            ...data,
            vaga: vagaData
          })
        }

        setCandidaturas(lista)
      } catch (err) {
        console.error('Erro ao carregar candidaturas:', err)
        setErro('Erro ao carregar candidaturas. Tente novamente.')
      }
      setLoading(false)
    }

    if (estabelecimentoUid) {
      carregarCandidaturas()
    }
  }, [estabelecimentoUid])

  async function alterarStatus(id, novoStatus) {
    try {
      const candRef = doc(db, 'candidaturas', id)
      await updateDoc(candRef, { status: novoStatus })
      setCandidaturas(candidaturas.map(c =>
        c.id === id ? { ...c, status: novoStatus } : c
      ))
    } catch (err) {
      console.error('Erro ao alterar status:', err)
      setErro('Erro ao atualizar candidatura.')
    }
  }

  if (loading) return <p>Carregando candidaturas...</p>
  if (erro) return <p className="text-red-600">{erro}</p>

  if (candidaturas.length === 0)
    return <p>Nenhuma candidatura recebida ainda.</p>

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">📋 Candidaturas Recebidas</h2>

      <div className="space-y-6">
        {candidaturas.map(cand => (
          <div
            key={cand.id}
            className="p-4 border rounded-xl shadow border-gray-300"
          >
            <h3 className="text-xl font-semibold text-orange-700">
              {cand.vaga?.funcao || 'Função desconhecida'}
            </h3>
            <p><strong>Vaga:</strong> {cand.vaga?.titulo || 'Título não informado'}</p>
            <p><strong>Candidato:</strong> {cand.freelaUid}</p>
            <p><strong>Status:</strong> <span className={
              cand.status === 'pendente' ? 'text-yellow-600' :
              cand.status === 'aprovado' ? 'text-green-600' : 'text-red-600'
            }>{cand.status.toUpperCase()}</span></p>

            <div className="mt-4 flex gap-3">
              {cand.status !== 'aprovado' && (
                <button
                  className="btn-primary bg-green-600 hover:bg-green-700"
                  onClick={() => alterarStatus(cand.id, 'aprovado')}
                >
                  Aprovar
                </button>
              )}
              {cand.status !== 'rejeitado' && (
                <button
                  className="btn-primary bg-red-600 hover:bg-red-700"
                  onClick={() => alterarStatus(cand.id, 'rejeitado')}
                >
                  Rejeitar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
