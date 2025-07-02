import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

export default function CandidaturasEstabelecimento({ estabelecimentoUid }) {
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarCandidaturas = async () => {
      if (!estabelecimentoUid) return

      setCarregando(true)

      try {
        const chamadasRef = collection(db, 'chamadas')
        const q = query(
          chamadasRef,
          where('estabelecimentoUid', '==', estabelecimentoUid),
          orderBy('dataCandidatura', 'desc') // Opcional: ordenação por data
        )
        const snapshot = await getDocs(q)

        const lista = await Promise.all(
          snapshot.docs.map(async docSnap => {
            const data = docSnap.data()

            const freelaRef = doc(db, 'usuarios', data.freelaUid)
            const vagaRef = doc(db, 'vagas', data.vagaId)

            const [freelaSnap, vagaSnap] = await Promise.all([
              getDoc(freelaRef),
              getDoc(vagaRef)
            ])

            return {
              id: docSnap.id,
              ...data,
              status: data.status?.toUpperCase() || 'PENDENTE',
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

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), { status: novoStatus })
      setCandidaturas(prev =>
        prev.map(c => (c.id === id ? { ...c, status: novoStatus.toUpperCase() } : c))
      )
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
            className="border border-gray-300 rounded-xl p-4 flex items-center justify-between bg-white shadow-sm"
          >
            <div className="flex items-center gap-4">
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
                      c.status === 'APROVADO'
                        ? 'bg-green-100 text-green-700'
                        : c.status === 'REJEITADO'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => atualizarStatus(c.id, 'APROVADO')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✅ Aprovar
              </button>
              <button
                onClick={() => atualizarStatus(c.id, 'REJEITADO')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ❌ Rejeitar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
