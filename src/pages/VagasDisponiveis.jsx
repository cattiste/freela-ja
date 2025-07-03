import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
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

  useEffect(() => {
    async function carregarVagas() {
      setLoading(true)
      setErro(null)
      try {
        const q = query(collection(db, 'vagas'), where('status', '==', 'aberta'))
        const snapshot = await getDocs(q)
        const listaVagas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        if (freela?.uid) {
          const qCand = query(
            collection(db, 'candidaturas'),
            where('freelaUid', '==', freela.uid)
          )
          const snapshotCand = await getDocs(qCand)
          const listaCandidaturas = snapshotCand.docs.map(doc => ({
            id: doc.id,
            vagaId: doc.data().vagaId,
            status: doc.data().status || 'pendente',
            mensagem: doc.data().mensagem || '',
            contato: doc.data().contato || '',
          }))
          setCandidaturas(listaCandidaturas)
        }

        setVagas(listaVagas)
      } catch (err) {
        console.error('Erro ao carregar vagas:', err)
        setErro('Erro ao carregar vagas. Tente novamente.')
      }
      setLoading(false)
    }
    carregarVagas()
  }, [freela?.uid])

  async function handleCandidatar(vaga) {
    if (!freela?.uid) {
      setErro('Você precisa estar logado para se candidatar.')
      return
    }

    setErro(null)
    setSucesso(null)

    try {
      const docRef = await addDoc(collection(db, 'candidaturas'), {
        vagaId: vaga.id,
        estabelecimentoUid: vaga.estabelecimentoUid || null,
        freelaUid: freela.uid,
        dataCandidatura: serverTimestamp(),
        status: 'pendente',
        mensagem: '',
        contato: '',
      })

      setSucesso(`Candidatura enviada para vaga: ${vaga.titulo || vaga.funcao || ''}`)

      setCandidaturas(prev => [
        ...prev,
        {
          id: docRef.id, // ✅ Agora inclui o ID da candidatura
          vagaId: vaga.id,
          status: 'pendente',
          mensagem: '',
          contato: '',
        },
      ])
    } catch (err) {
      console.error('Erro ao candidatar:', err)
      setErro('Erro ao enviar candidatura. Tente novamente.')
    }
  }

  async function handleExcluirCandidatura(candidaturaId) {
    try {
      await deleteDoc(doc(db, 'candidaturas', candidaturaId))
      setCandidaturas(prev => prev.filter(c => c.id !== candidaturaId))
      setSucesso('Candidatura excluída com sucesso.')
    } catch (err) {
      console.error('Erro ao excluir candidatura:', err)
      setErro('Erro ao excluir candidatura.')
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
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">🎯 Vagas Disponíveis</h2>

      {erro && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 relative">
          {erro}
          <button
            onClick={() => setErro(null)}
            className="absolute top-1 right-2 font-bold hover:text-red-900"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {sucesso && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700 relative">
          {sucesso}
          <button
            onClick={() => setSucesso(null)}
            className="absolute top-1 right-2 font-bold hover:text-green-900"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {vagas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma vaga disponível no momento.</p>
      ) : (
        <div className="space-y-6">
          {vagas.map(vaga => {
            const candidatura = getCandidaturaDaVaga(vaga.id)

            return (
              <div
                key={vaga.id}
                className={`p-5 border rounded-xl shadow ${
                  vaga.urgente ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <h3 className="text-xl font-semibold text-orange-700 mb-2">
                  {vaga.titulo || vaga.funcao || 'Sem título'}
                </h3>

                <p>
                  <strong>Tipo:</strong>{' '}
                  {vaga.tipoVaga?.toLowerCase() === 'clt' ? 'CLT (Fixa)' : 'Freela (Diária)'}
                </p>

                {vaga.tipoVaga?.toLowerCase() === 'freela' && vaga.valorDiaria != null && (
                  <p>
                    <strong>Valor da diária:</strong> R${' '}
                    {Number(vaga.valorDiaria).toFixed(2).replace('.', ',')}
                  </p>
                )}

                {vaga.tipoVaga?.toLowerCase() === 'clt' && vaga.salario != null && (
                  <p>
                    <strong>Salário:</strong> R$ {Number(vaga.salario).toFixed(2).replace('.', ',')}
                  </p>
                )}

                <p>
                  <strong>Data da publicação:</strong> {formatarData(vaga.dataPublicacao)}
                </p>

                {vaga.descricao && (
                  <p className="mt-2 text-gray-700">
                    <strong>Descrição:</strong> {vaga.descricao}
                  </p>
                )}

                {vaga.urgente && (
                  <p className="text-red-600 font-semibold mt-3 uppercase tracking-wide">URGENTE</p>
                )}

                {/* Status e botões */}
                {candidatura ? (
                  <>
                    <p className="mt-4 font-semibold">
                      Status da candidatura:{' '}
                      <span
                        className={`px-2 py-1 rounded ${
                          candidatura.status.toLowerCase() === 'aprovado'
                            ? 'bg-green-100 text-green-700'
                            : candidatura.status.toLowerCase() === 'rejeitado'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {candidatura.status.toUpperCase()}
                      </span>
                    </p>

                    {candidatura.status.toLowerCase() === 'rejeitado' && candidatura.mensagem && (
                      <p className="mt-2 text-red-700 italic">
                        Mensagem do estabelecimento: {candidatura.mensagem}
                      </p>
                    )}

                    {candidatura.status.toLowerCase() === 'aprovado' && candidatura.contato && (
                      <p className="mt-2">
                        📞 <strong>Contato do estabelecimento:</strong> {candidatura.contato}
                      </p>
                    )}

                    {candidatura.status.toLowerCase() === 'rejeitado' && (
                      <button
                        onClick={() => handleExcluirCandidatura(candidatura.id)}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        🗑️ Excluir candidatura
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleCandidatar(vaga)}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
                  >
                    Candidatar-se
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
