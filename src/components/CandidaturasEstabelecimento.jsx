import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function CandidaturasEstabelecimento({ estabelecimentoUid }) {
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mensagemRejeicao, setMensagemRejeicao] = useState('')

  useEffect(() => {
    if (!estabelecimentoUid) return

    const buscarCandidaturas = async () => {
      try {
        const candidaturasRef = collection(db, 'candidaturas')
        const q = query(candidaturasRef, where('estabelecimentoUid', '==', estabelecimentoUid))
        const snapshot = await getDocs(q)

        const lista = await Promise.all(
          snapshot.docs.map(async docSnap => {
            const data = docSnap.data()

            // Buscar dados do freela
            const freelaRef = doc(db, 'usuarios', data.freelaUid)
            const freelaSnap = await getDoc(freelaRef)

            // Buscar dados da vaga
            const vagaRef = doc(db, 'vagas', data.vagaId)
            const vagaSnap = await getDoc(vagaRef)

            return {
              id: docSnap.id,
              ...data,
              freela: freelaSnap.exists() ? freelaSnap.data() : null,
              vaga: vagaSnap.exists() ? vagaSnap.data() : null
            }
          })
        )

        setCandidaturas(lista)
      } catch (err) {
        console.error('Erro ao buscar candidaturas:', err)
      } finally {
        setCarregando(false)
      }
    }

    buscarCandidaturas()
  }, [estabelecimentoUid])

  const atualizarStatus = async (id, novoStatus, mensagem = '') => {
    try {
      await updateDoc(doc(db, 'candidaturas', id), { 
        status: novoStatus,
        mensagemRejeicao: mensagem,
      })
      setCandidaturas(prev =>
        prev.map(c => (c.id === id ? { ...c, status: novoStatus, mensagemRejeicao: mensagem } : c))
      )
      setMensagemRejeicao('')
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  if (carregando) {
    return <p className="text-center text-orange-600">Carregando candidaturas...</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">📋 Candidaturas Recebidas</h2>

      {candidaturas.length === 0 ? (
        <p className="text-gray-600">Nenhuma candidatura recebida ainda.</p>
      ) : (
        candidaturas.map(c => (
          <div
            key={c.id}
            className="border border-gray-300 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow-sm gap-4"
          >
            <div className="flex items-center gap-4 flex-1">
              {c.freela?.foto ? (
                <img
                  src={c.freela.foto}
                  alt="Foto do freela"
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-orange-200 flex items-center justify-center text-xl font-bold text-orange-700">
                  {c.freela?.nome?.[0] || 'F'}
                </div>
              )}

              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {c.freela?.nome || 'Freelancer Desconhecido'}
                </p>
                <p className="text-sm text-gray-500">{c.freela?.funcao || 'Função não informada'}</p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium text-orange-700">Vaga:</span>{' '}
                  {c.vaga?.titulo || 'Vaga desconhecida'}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded ${
                      c.status?.toLowerCase() === 'aprovado'
                        ? 'bg-green-100 text-green-700'
                        : c.status?.toLowerCase() === 'rejeitado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status?.toUpperCase() || 'PENDENTE'}
                  </span>
                </p>
                {c.status?.toLowerCase() === 'rejeitado' && c.mensagemRejeicao && (
                  <p className="mt-2 p-2 bg-red-50 text-red-700 rounded border border-red-200">
                    💬 Mensagem do estabelecimento: {c.mensagemRejeicao}
                  </p>
                )}
                {c.status?.toLowerCase() === 'aprovado' && c.estabelecimentoContato && (
                  <p className="mt-2 p-2 bg-green-50 text-green-700 rounded border border-green-200">
                    📞 Contato do estabelecimento: {c.estabelecimentoContato}
                  </p>
                )}
              </div>
            </div>

            {c.status?.toLowerCase() === 'pendente' && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => atualizarStatus(c.id, 'aprovado', '')}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✅ Aprovar
                </button>
                <textarea
                  placeholder="Mensagem para rejeição (opcional)"
                  className="border border-gray-300 rounded p-2 mt-2 resize-none"
                  value={mensagemRejeicao}
                  onChange={e => setMensagemRejeicao(e.target.value)}
                />
                <button
                  onClick={() => atualizarStatus(c.id, 'rejeitado', mensagemRejeicao)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 mt-1"
                >
                  ❌ Rejeitar
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
